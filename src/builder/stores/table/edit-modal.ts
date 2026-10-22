import { type TableHeaderState, SortFunctions } from "src/builder/builder.types";
import { Modal, Setting, TextAreaComponent } from "obsidian";
import { EditorView } from "@codemirror/view";
import { editorFromTextArea } from "../../../utils/editor/index";

export class EditModal extends Modal {
    public header: TableHeaderState;
    public editing: boolean;
    editor: EditorView;
    public canceled = false;
    onOpen() {
        this.titleEl.setText(this.editing ? "Editar coluna" : "Criar coluna");
        this.display();
    }
    display() {
        this.contentEl.empty();
        new Setting(this.contentEl).setName("Texto exibido").addText((t) =>
            t.setValue(this.header.text).onChange((v) => {
                this.header.text = v;
            })
        );
        new Setting(this.contentEl)
            .setName("Propriedade vinculada")
            .addText((t) =>
                t
                    .setValue(this.header.field)
                    .onChange((v) => (this.header.field = v))
            );
        new Setting(this.contentEl)
            .setName("Tipo de ordenação")
            .setDesc(
                "Define como o campo é ordenado. Use o tipo adequado aos dados do campo."
            )
            .addDropdown((t) => {
                t.addOption(`${SortFunctions.LOCAL_COMPARE}`, "Texto");
                t.addOption(`${SortFunctions.CONVERT_FRACTION}`, "Número");
                t.addOption(`${SortFunctions.CUSTOM}`, "Personalizado");
                t.setValue(`${this.header.type}`).onChange((v) => {
                    this.header.type = Number(v);
                    if (this.header.type == SortFunctions.CUSTOM) {
                        this.header.func = ``;
                    } else {
                        delete this.header.func;
                    }
                    this.display();
                });
            });
        if ("func" in this.header) {
            new Setting(this.contentEl)
                .setName("Função de ordenação personalizada")
                .setDesc(
                    createFragment((e) => {
                        e.createSpan({
                            text: "Informe uma função JavaScript de ordenação."
                        });
                        e.createEl("br");
                        e.createEl("br");

                        e.createSpan({
                            text: "A função recebe dois objetos de criatura, "
                        });
                        e.createEl("code", { text: "a" });
                        e.createSpan({ text: " e " });
                        e.createEl("code", { text: "b" });
                        e.createSpan({
                            text: ", e deve retornar um número, que define a ordem."
                        });
                    })
                );
            const component = new TextAreaComponent(this.contentEl).setValue(
                this.header.func!
            );
            component.inputEl.addClass("initiative-tracker-textarea");
            this.editor = editorFromTextArea(
                component.inputEl,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        this.header.func = update.state.doc.toString();
                    }
                })
            );
        }
        new Setting(this.contentEl).addButton((b) => {
            b.setButtonText("Cancelar")
                .setCta()
                .onClick(() => {
                    this.canceled = true;
                    this.close();
                });
        });
    }
    close() {
        this.editor?.destroy();
        super.close();
    }
}
