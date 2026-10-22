<script lang="ts">
    import { ExtraButtonComponent, Menu } from "obsidian";
    import {
        DISABLE,
        ENABLE,
        HIDDEN,
        HP,
        REMOVE,
        TAG
    } from "src/utils";
    import type { Creature } from "src/utils/creature";
    import type TrackerView from "src/tracker/view";
    import { createEventDispatcher, getContext } from "svelte";
    import type InitiativeTracker from "src/main";
    import { tracker } from "src/tracker/stores/tracker";

    const dispatch = createEventDispatcher();

    export let creature: Creature;

    const plugin = getContext<InitiativeTracker>("plugin");

    const hamburgerIcon = (node: HTMLElement) => {
        const hamburger = new ExtraButtonComponent(node)
            .setIcon("vertical-three-dots")
            .setTooltip("Ações");
        // Tocar de novo no botão fecha o menu. O Obsidian já fecha o menu no toque fora dele,
        // antes do clique chegar aqui; por isso o menu fechado há instantes não é reaberto.
        let menuAberto: Menu = null;
        let fechadoEm = 0;
        hamburger.extraSettingsEl.onclick = (evt) => {
            evt.stopPropagation();
            if (menuAberto) {
                menuAberto.hide();
                return;
            }
            if (Date.now() - fechadoEm < 400) return;
            const menu = new Menu();
            menuAberto = menu;
            menu.onHide(() => {
                menuAberto = null;
                fechadoEm = Date.now();
            });
            menu.addItem((item) => {
                item.setIcon(HP)
                    .setTitle("Definir PV/condições")
                    .onClick((e: MouseEvent) => {
                        tracker.updateTarget.set("hp");
                        tracker.setUpdate(creature, e);
                    });
            });
            if (creature.current_ac != creature.ac) {
                menu.addItem((item) => {
                    item.setIcon(HP)
                        .setTitle("Restaurar CA")
                        .onClick((e: MouseEvent) => {
                            creature.current_ac = creature.ac;
                            tracker.updateAndSave();
                        });
                });
            }
            menu.addItem((item) => {
                item.setIcon("pencil")
                    .setTitle("Editar")
                    .onClick(() => {
                        dispatch("edit", creature);
                    });
            });
            if (creature.hidden) {
                menu.addItem((item) => {
                    item.setIcon("eye")
                        .setTitle("Mostrar")
                        .onClick(() => {
                            tracker.updateCreatures({
                                creature,
                                change: { hidden: false }
                            });
                        });
                });
            } else {
                menu.addItem((item) => {
                    item.setIcon(HIDDEN)
                        .setTitle("Ocultar")
                        .onClick(() => {
                            tracker.updateCreatures({
                                creature,
                                change: { hidden: true }
                            });
                        });
                });
            }
            if (creature.enabled) {
                menu.addItem((item) => {
                    item.setIcon(DISABLE)
                        .setTitle("Desativar")
                        .onClick(() => {
                            tracker.updateCreatures({
                                creature,
                                change: { enabled: false }
                            });
                        });
                });
            } else {
                menu.addItem((item) => {
                    item.setIcon(ENABLE)
                        .setTitle("Ativar")
                        .onClick(() => {
                            tracker.updateCreatures({
                                creature,
                                change: { enabled: true }
                            });
                        });
                });
            }
            menu.addItem((item) => {
                item.setIcon(REMOVE)
                    .setTitle("Remover")
                    .onClick(() => {
                        tracker.remove(creature);
                    });
            });
            // Posiciona pelo botão, não pelo evento: no iPad o evento vem sem coordenadas e o menu ia para o canto da tela.
            const r = hamburger.extraSettingsEl.getBoundingClientRect();
            menu.showAtPosition({ x: r.left, y: r.bottom });
        };
    };
</script>

<div class="controls">
    <div class="add-button icon" use:hamburgerIcon />
</div>

<style>
    .controls {
        display: flex;
        justify-content: flex-end;
    }
    .icon :global(.clickable-icon) {
        margin-right: 0;
    }
</style>
