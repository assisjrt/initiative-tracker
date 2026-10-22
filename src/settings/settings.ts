import {
    addIcon,
    ExtraButtonComponent,
    normalizePath,
    Notice,
    PluginSettingTab,
    setIcon,
    Setting,
    TextComponent,
    TFolder
} from "obsidian";

import type InitiativeTracker from "../main";

import { PlayerSuggestionModal } from "../utils/suggester";
import { FileInputSuggest, FolderInputSuggest } from "obsidian-utilities";
import {
    AC,
    Conditions,
    DEFAULT_UNDEFINED,
    EDIT,
    HP,
    INITIATIVE,
    OVERFLOW_TYPE,
    RESOLVE_TIES
} from "../utils";
import { RpgSystemSetting, getRpgSystem } from "../utils/rpg-system";
import type { Party } from "./settings.types";
import type { InputValidate } from "./settings.types";
import type { Condition } from "src/types/creatures";
import type { HomebrewCreature } from "src/types/creatures";

export default class InitiativeTrackerSettings extends PluginSettingTab {
    constructor(private plugin: InitiativeTracker) {
        super(plugin.app, plugin);
    }
    async display(): Promise<void> {
        try {
            let { containerEl } = this;

            containerEl.empty();
            containerEl.addClass("initiative-tracker-settings");

            containerEl.createEl("h2", { text: "Configurações do Initiative Tracker" });

            this._displayBase(containerEl.createDiv());
            if (!this.plugin.data.openState) {
                this.plugin.data.openState = {
                    battle: true,
                    player: true,
                    party: true,
                    plugin: true,
                    status: true,
                    builder: true
                };
            }
            this._displayBattle(
                containerEl.createEl("details", {
                    cls: "initiative-tracker-additional-container",
                    attr: {
                        ...(this.plugin.data.openState.player
                            ? { open: true }
                            : {})
                    }
                })
            );
            this._displayPlayers(
                containerEl.createEl("details", {
                    cls: "initiative-tracker-additional-container",
                    attr: {
                        ...(this.plugin.data.openState.player
                            ? { open: true }
                            : {})
                    }
                })
            );
            this._displayParties(
                containerEl.createEl("details", {
                    cls: "initiative-tracker-additional-container",
                    attr: {
                        ...(this.plugin.data.openState.party
                            ? { open: true }
                            : {})
                    }
                })
            );
            this._displayBuilder(
                containerEl.createEl("details", {
                    cls: "initiative-tracker-additional-container",
                    attr: {
                        ...(this.plugin.data.openState.builder
                            ? { open: true }
                            : {})
                    }
                })
            );
            this._displayStatuses(
                containerEl.createEl("details", {
                    cls: "initiative-tracker-additional-container",
                    attr: {
                        ...(this.plugin.data.openState.status
                            ? { open: true }
                            : {})
                    }
                })
            );
            this._displayIntegrations(
                containerEl.createEl("details", {
                    cls: "initiative-tracker-additional-container",
                    attr: {
                        ...(this.plugin.data.openState.plugin
                            ? { open: true }
                            : {})
                    }
                })
            );

            const div = containerEl.createDiv("coffee");
            div.createEl("a", {
                href: "https://www.buymeacoffee.com/valentine195"
            }).createEl("img", {
                attr: {
                    src: "https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=valentine195&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=ff0000"
                }
            });
        } catch (e) {
            console.error(e);
            new Notice(
                "Ocorreu um erro ao exibir a aba de configurações do Initiative Tracker."
            );
        }
    }

    private _displayBase(containerEl: HTMLDivElement) {
        containerEl.empty();
        new Setting(containerEl).setHeading().setName("Configurações básicas");
        new Setting(containerEl)
            .setName("Exibir dicas para iniciantes")
            .setDesc(
                "Exibe instruções no rastreador de iniciativa para ajudar você a se acostumar com o fluxo de uso."
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.beginnerTips).onChange(
                    async (v) => {
                        this.plugin.data.beginnerTips = v;
                        await this.plugin.saveSettings();
                    }
                );
            });
        new Setting(containerEl)
            .setName("Exibir dificuldade do encontro")
            .setDesc(
                "Exibe a dificuldade do encontro com base no nível (ou ND) das criaturas e no nível dos jogadores. Criaturas sem nível ou ND não entram no cálculo."
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.displayDifficulty).onChange(
                    async (v) => {
                        this.plugin.data.displayDifficulty = v;
                        await this.plugin.saveSettings();
                    }
                );
            });
        new Setting(containerEl)
            .setName("Rolar criaturas equivalentes juntas")
            .setDesc(
                "Criaturas equivalentes (mesmo nome e mesma CA) rolam a mesma iniciativa por padrão."
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.condense).onChange(async (v) => {
                    this.plugin.data.condense = v;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Incorporar o conteúdo de statblock-link na visualização da criatura")
            .setDesc(
                "Prefere o conteúdo incorporado do atributo statblock-link quando existir. Se o link não existir e o plugin estiver ativo, usa o plugin de fichas."
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.preferStatblockLink).onChange(
                    async (v) => {
                        this.plugin.data.preferStatblockLink = v;
                        await this.plugin.saveSettings();
                    }
                );
            });
    }
    private async _displayBattle(additionalContainer: HTMLDetailsElement) {
        additionalContainer.empty();
        additionalContainer.ontoggle = () => {
            this.plugin.data.openState.battle = additionalContainer.open;
        };
        const summary = additionalContainer.createEl("summary");
        new Setting(summary).setHeading().setName("Combate");
        summary.createDiv("collapser").createDiv("handle");
        new Setting(additionalContainer)
            .setName("Limitar PV mínimo")
            .setDesc(
                "Quando uma criatura sofre dano que reduziria seus PV abaixo de 0, os PV ficam em 0."
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.clamp).onChange(async (v) => {
                    this.plugin.data.clamp = v;
                    await this.plugin.saveSettings();
                });
            });
        new Setting(additionalContainer)
            .setName("Cura excedente")
            .setDesc(
                "Define o que acontece com a cura que ultrapassa os PV máximos da criatura."
            )
            .addDropdown((d) => {
                d.addOption(OVERFLOW_TYPE.ignore, "Ignorar");
                d.addOption(OVERFLOW_TYPE.temp, "Somar aos PV temporários");
                d.addOption(OVERFLOW_TYPE.current, "Somar aos PV atuais");
                d.setValue(this.plugin.data.hpOverflow ?? OVERFLOW_TYPE.ignore);
                d.onChange(async (v) => {
                    this.plugin.data.hpOverflow = v;
                    this.plugin.saveSettings();
                });
            });
        new Setting(additionalContainer)
            .setName("Aplicar inconsciente automaticamente")
            .setDesc(
                'Quando uma criatura sofre dano que reduziria seus PV abaixo de 0, ela recebe a condição de inconsciente definida em Condições.'
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.autoStatus).onChange(async (v) => {
                    this.plugin.data.autoStatus = v;
                    await this.plugin.saveSettings();
                });
            });
        new Setting(additionalContainer)
            .setName("PV temporários cumulativos")
            .setDesc(
                "PV temporários novos são somados aos PV temporários que a criatura já tem."
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.additiveTemp).onChange(
                    async (v) => {
                        this.plugin.data.additiveTemp = v;
                        await this.plugin.saveSettings();
                    }
                );
            });
        new Setting(additionalContainer)
            .setName("Exibir PV dos jogadores na visão dos jogadores")
            .setDesc(
                "Se desativado, a saúde dos jogadores aparece como 'Saudável', 'Ferido' etc."
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.diplayPlayerHPValues).onChange(
                    async (v) => {
                        this.plugin.data.diplayPlayerHPValues = v;
                        await this.plugin.saveSettings();
                    }
                );
            });
        new Setting(additionalContainer)
            .setName("Rolar PV das criaturas")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "Criaturas adicionadas aos encontros rolam os PV automaticamente se a propriedade "
                    });
                    e.createEl("code", { text: "hit_dice" });
                    e.createSpan({
                        text: " estiver definida na criatura."
                    });
                })
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.rollHP).onChange(async (v) => {
                    this.plugin.data.rollHP = v;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(additionalContainer)
            .setName("Registrar combates")
            .setDesc(
                "As ações do combate são registradas na pasta de registro definida."
            )
            .addToggle((t) =>
                t.setValue(this.plugin.data.logging).onChange(async (v) => {
                    this.plugin.data.logging = v;
                    await this.plugin.saveSettings();
                })
            );

        const exists = await this.plugin.app.vault.adapter.exists(
            this.plugin.data.logFolder
        );
        new Setting(additionalContainer)
            .setName("Pasta de registro")
            .setDesc(
                createFragment(async (e) => {
                    e.createSpan({
                        text: "Uma nota nova é criada nesta pasta para cada combate."
                    });
                    e.createEl("br");
                    e.createSpan({ text: "Atual: " });
                    e.createEl("code", { text: this.plugin.data.logFolder });

                    if (!exists) {
                        e.createEl("br");
                        const container = e.createDiv(
                            "initiative-tracker-warning"
                        );
                        setIcon(container, "initiative-tracker-warning");
                        container.createSpan({
                            text: "Esta pasta não existe e será criada quando o primeiro registro for gravado."
                        });
                    }
                })
            )
            .addText((t) => {
                t.setValue(this.plugin.data.logFolder);
                let folders = this.app.vault
                    .getAllLoadedFiles()
                    .filter((f) => f instanceof TFolder);
                const modal = new FolderInputSuggest(
                    this.app,
                    t,
                    folders as TFolder[]
                );
                modal.onSelect(async ({ item }) => {
                    this.plugin.data.logFolder = normalizePath(item.path);
                    await this.plugin.saveSettings();
                    this.display();
                });
            });
        new Setting(additionalContainer)
            .setName("Desempate de iniciativa")
            .setDesc(
                "Define o que acontece quando duas criaturas têm a mesma iniciativa."
            )
            .addDropdown((d) => {
                d.addOption(RESOLVE_TIES.playerFirst, "Jogador primeiro");
                d.addOption(RESOLVE_TIES.npcFirst, "NPC primeiro");
                d.addOption(RESOLVE_TIES.random, "Aleatório");
                d.setValue(
                    this.plugin.data.resolveTies ?? RESOLVE_TIES.playerFirst
                );
                d.onChange(async (v) => {
                    this.plugin.data.resolveTies = v;
                    this.plugin.saveSettings();
                });
            });
    }
    private _displayPlayers(additionalContainer: HTMLDetailsElement) {
        additionalContainer.empty();
        additionalContainer.ontoggle = () => {
            this.plugin.data.openState.player = additionalContainer.open;
        };
        const summary = additionalContainer.createEl("summary");
        new Setting(summary).setHeading().setName("Jogadores");
        summary.createDiv("collapser").createDiv("handle");
        new Setting(additionalContainer)
            .setName("Adicionar jogador")
            .setDesc(
                "Os jogadores adicionados aqui ficam disponíveis para entrar em grupos. Se não houver grupo criado, todos os jogadores entram em cada encontro novo."
            )
            .addButton((button: ButtonComponent): ButtonComponent => {
                let b = button
                    .setTooltip("Adicionar jogador")
                    .setButtonText("+")
                    .onClick(async () => {
                        const modal = new NewPlayerModal(this.plugin);
                        modal.open();
                        modal.onClose = async () => {
                            if (!modal.saved) return;

                            await this.plugin.savePlayer({
                                ...modal.player,
                                player: true
                            });

                            this._displayPlayers(additionalContainer);
                        };
                    });

                return b;
            });
        const additional = additionalContainer.createDiv("additional");
        const playerView = additional.createDiv("initiative-tracker-players");
        if (!this.plugin.players.size) {
            additional
                .createDiv({
                    attr: {
                        style: "display: flex; justify-content: center; padding-bottom: 18px;"
                    }
                })
                .createSpan({
                    text: "Nenhum jogador salvo. Crie um para vê-lo aqui."
                });
        } else {
            const headers = playerView.createDiv(
                "initiative-tracker-player headers"
            );

            headers.createDiv({ text: "Nome" });
            setIcon(
                headers.createDiv({
                    attr: {
                        "aria-label": "Nível"
                    }
                }),
                "swords"
            );
            setIcon(
                headers.createDiv({
                    attr: {
                        "aria-label": "PV máximos"
                    }
                }),
                HP
            );
            setIcon(
                headers.createDiv({
                    attr: {
                        "aria-label": "Classe de Armadura"
                    }
                }),
                AC
            );
            setIcon(
                headers.createDiv({
                    attr: {
                        "aria-label": "Modificador de iniciativa"
                    }
                }),
                INITIATIVE
            );
            headers.createDiv();

            for (let player of this.plugin.data.players) {
                const playerDiv = playerView.createDiv(
                    "initiative-tracker-player"
                );
                playerDiv.createDiv({ text: player.name });
                playerDiv.createDiv({
                    text: `${player.level ?? DEFAULT_UNDEFINED}`
                });
                playerDiv.createDiv({
                    text: `${player.hp ?? DEFAULT_UNDEFINED}`
                });
                playerDiv.createDiv({
                    text: `${player.ac ?? DEFAULT_UNDEFINED}`
                });
                playerDiv.createDiv({
                    text: `${player.modifier ?? DEFAULT_UNDEFINED}`
                });
                const icons = playerDiv.createDiv(
                    "initiative-tracker-player-icon"
                );
                new ExtraButtonComponent(icons.createDiv())
                    .setIcon("pencil")
                    .setTooltip("Editar")
                    .onClick(() => {
                        const modal = new NewPlayerModal(this.plugin, player);
                        modal.open();
                        modal.onClose = async () => {
                            if (!modal.saved) return;
                            await this.plugin.updatePlayer(
                                player,
                                modal.player
                            );

                            this._displayPlayers(additionalContainer);
                        };
                    });
                new ExtraButtonComponent(icons.createDiv())
                    .setIcon("trash")
                    .setTooltip("Excluir")
                    .onClick(async () => {
                        this.plugin.deletePlayer(player);

                        await this.plugin.saveSettings();
                        this._displayPlayers(additionalContainer);
                    });
            }
            for (let [name, player] of this.plugin.statblock_players) {
                const playerDiv = playerView.createDiv(
                    "initiative-tracker-player"
                );
                playerDiv.createDiv({ text: name });
                playerDiv.createDiv({
                    text: `${player.level ?? DEFAULT_UNDEFINED}`
                });
                playerDiv.createDiv({
                    text: `${player.hp ?? DEFAULT_UNDEFINED}`
                });
                playerDiv.createDiv({
                    text: `${player.ac ?? DEFAULT_UNDEFINED}`
                });
                playerDiv.createDiv({
                    text: `${player.modifier ?? DEFAULT_UNDEFINED}`
                });
                const icons = playerDiv.createDiv({
                    cls: "initiative-tracker-player-icon imported",
                    attr: {
                        "aria-label": "Importado do Fantasy Statblocks"
                    }
                });
                setIcon(icons, "heart-handshake");
            }
        }
    }
    private _displayBuilder(additionalContainer: HTMLDetailsElement) {
        additionalContainer.empty();
        additionalContainer.ontoggle = () => {
            this.plugin.data.openState.player = additionalContainer.open;
        };
        const summary = additionalContainer.createEl("summary");
        new Setting(summary).setHeading().setName("Encontros");
        summary.createDiv("collapser").createDiv("handle");
        const explanation = additionalContainer.createDiv(
            "initiative-tracker-explanation"
        );
        explanation.createEl("span", {
            text: "O construtor de encontros cria encontros rapidamente, para salvar e usar depois ou iniciar o combate na hora."
        });
        explanation.createEl("br");
        explanation.createEl("br");
        explanation.createEl("span", {
            text: "Ele abre pelo atalho da barra lateral (se ativado) ou pelo comando Abrir construtor de encontros."
        });
        new Setting(additionalContainer)
            .setName("Atalho na barra lateral")
            .setDesc(
                "Adiciona um atalho na barra lateral para abrir o construtor de encontros."
            )
            .addToggle((t) => {
                t.setValue(this.plugin.data.builder.sidebarIcon).onChange(
                    (v) => {
                        this.plugin.data.builder.sidebarIcon = v;
                        this.plugin.setBuilderIcon();
                    }
                );
            });
        new Setting(additionalContainer)
            .setName("Sistema de XP")
            .setDesc("Sistema de XP usado nos encontros")
            .addDropdown((d) => {
                Object.values(RpgSystemSetting).forEach((system) =>
                    d.addOption(
                        system,
                        getRpgSystem(this.plugin, system).displayName
                    )
                );
                d.setValue(
                    this.plugin.data.rpgSystem ?? RpgSystemSetting.Dnd5e
                );
                d.onChange(async (v) => {
                    this.plugin.data.rpgSystem = v;
                    this.plugin.saveSettings();
                });
            });

        const additional = additionalContainer.createDiv("additional");
        new Setting(additional).setHeading().setName("Encontros salvos");
        if (!Object.keys(this.plugin.data.encounters).length) {
            additional
                .createDiv({
                    attr: {
                        style: "display: flex; justify-content: center; padding-bottom: 18px;"
                    }
                })
                .createSpan({
                    text: "Nenhum encontro salvo. Crie um para vê-lo aqui."
                });
        } else {
            for (const [name, encounter] of Object.entries(
                this.plugin.data.encounters
            )) {
                new Setting(additional)
                    .setName(name)
                    .setDesc(
                        createFragment((e) => {
                            const players = [],
                                creatures = [];
                            for (const creature of encounter.creatures) {
                                if (creature.player) {
                                    players.push(creature.name);
                                } else {
                                    creatures.push(creature.name);
                                }
                            }

                            if (players.length) {
                                e.createSpan({
                                    text: `Jogadores: ${players.join(", ")}`
                                });
                                e.createEl("br");
                            }
                            if (creatures.length) {
                                e.createSpan({
                                    text: `Criaturas: ${creatures.join(", ")}`
                                });
                                e.createEl("br");
                            }

                            if (encounter.timestamp) {
                                e.createSpan({
                                    text: `${new Date(
                                        encounter.timestamp
                                    ).toLocaleString()}`
                                });
                            }
                        })
                    )
                    .addExtraButton((b) => {
                        b.setIcon("trash").onClick(async () => {
                            this.plugin.removeEncounter(name);
                            await this.plugin.saveSettings();
                            this._displayBuilder(additionalContainer);
                        });
                    });
            }
        }
    }
    private _displayParties(additionalContainer: HTMLDetailsElement) {
        additionalContainer.empty();
        additionalContainer.ontoggle = () => {
            this.plugin.data.openState.party = additionalContainer.open;
        };
        const summary = additionalContainer.createEl("summary");
        new Setting(summary).setHeading().setName("Grupos");
        summary.createDiv("collapser").createDiv("handle");
        const explanation = additionalContainer.createDiv(
            "initiative-tracker-explanation"
        );
        explanation.createEl("span", {
            text: "Grupos permitem montar conjuntos diferentes de jogadores. Cada jogador pode estar em vários grupos."
        });
        explanation.createEl("br");
        explanation.createEl("br");
        explanation.createEl("span", {
            text: "Você pode definir um grupo padrão para os encontros ou indicar o grupo no bloco do encontro. Durante o encontro, dá para trocar o grupo ativo no rastreador e mudar rapidamente quem está no combate."
        });
        new Setting(additionalContainer)
            .setName("Grupo padrão")
            .setDesc(
                "O rastreador carrega este grupo nos encontros por padrão."
            )
            .addDropdown((d) => {
                d.addOption("none", "Nenhum");
                for (const party of this.plugin.data.parties) {
                    d.addOption(party.name, party.name);
                }
                d.setValue(this.plugin.data.defaultParty ?? "none");
                d.onChange(async (v) => {
                    this.plugin.data.defaultParty = v == "none" ? null : v;
                    this.plugin.saveSettings();
                });
            });
        new Setting(additionalContainer)
            .setName("Adicionar grupo")
            .addButton((button: ButtonComponent): ButtonComponent => {
                let b = button
                    .setTooltip("Adicionar grupo")
                    .setButtonText("+")
                    .onClick(async () => {
                        const modal = new PartyModal(this.plugin);
                        modal.open();
                        modal.onClose = async () => {
                            if (modal.canceled) return;
                            if (!modal.party.name || !modal.party.name.length)
                                return;
                            if (
                                this.plugin.data.parties.filter(
                                    (party) => party.name == modal.party.name
                                )
                            ) {
                                const map = new Map(
                                    [...this.plugin.data.parties].map((c) => [
                                        c.name,
                                        c
                                    ])
                                );
                                map.set(modal.party.name, modal.party);
                                this.plugin.data.parties = Array.from(
                                    map.values()
                                );
                            } else {
                                this.plugin.data.parties.push(modal.party);
                            }

                            await this.plugin.saveSettings();

                            this._displayParties(additionalContainer);
                        };
                    });

                return b;
            });
        const additional = additionalContainer.createDiv("additional");
        if (!this.plugin.data.parties.length) {
            additional
                .createDiv({
                    attr: {
                        style: "display: flex; justify-content: center; padding-bottom: 18px;"
                    }
                })
                .createSpan({
                    text: "Nenhum grupo salvo. Crie um para vê-lo aqui."
                });
        } else {
            for (const party of this.plugin.data.parties) {
                new Setting(additional)
                    .setName(party.name)
                    .setDesc(party.players.join(", "))
                    .addExtraButton((b) => {
                        b.setIcon("pencil").onClick(() => {
                            const modal = new PartyModal(this.plugin, party);
                            modal.open();
                            modal.onClose = async () => {
                                if (modal.canceled) return;
                                if (
                                    !modal.party.name ||
                                    !modal.party.name.length
                                )
                                    return;

                                this.plugin.data.parties.splice(
                                    this.plugin.data.parties.indexOf(party),
                                    1,
                                    modal.party
                                );
                                if (
                                    this.plugin.data.parties.filter(
                                        (s) => s.name == modal.party.name
                                    ).length > 1
                                ) {
                                    if (
                                        this.plugin.data.parties.filter(
                                            (status) =>
                                                status.name == modal.party.name
                                        )
                                    ) {
                                        const map = new Map(
                                            this.plugin.data.parties.map(
                                                (c) => [c.name, c]
                                            )
                                        );
                                        map.set(modal.party.name, modal.party);
                                        this.plugin.data.parties = Array.from(
                                            map.values()
                                        );
                                    }
                                }

                                await this.plugin.saveSettings();

                                this._displayParties(additionalContainer);
                            };
                        });
                    })
                    .addExtraButton((b) => {
                        b.setIcon("trash").onClick(async () => {
                            this.plugin.data.parties =
                                this.plugin.data.parties.filter(
                                    (p) => p.name != party.name
                                );
                            if (this.plugin.data.defaultParty == party.name) {
                                this.plugin.data.defaultParty =
                                    this.plugin.data.parties[0]?.name ?? null;
                            }
                            await this.plugin.saveSettings();
                            this._displayParties(additionalContainer);
                        });
                    });
            }
        }
    }
    private _displayStatuses(additionalContainer: HTMLDetailsElement) {
        additionalContainer.empty();
        additionalContainer.ontoggle = () => {
            this.plugin.data.openState.status = additionalContainer.open;
        };
        const summary = additionalContainer.createEl("summary");
        new Setting(summary).setHeading().setName("Condições");

        new Setting(additionalContainer)
            .setName("Condição de inconsciente")
            .setDesc(
                "Escolha a condição usada como inconsciente."
            )
            .addDropdown((d) => {
                for (const status of this.plugin.data.statuses) {
                    d.addOption(status.id, status.name);
                }
                d.setValue(this.plugin.data.unconsciousId);
                d.onChange((id) => (this.plugin.data.unconsciousId = id));
            });
        summary.createDiv("collapser").createDiv("handle");
        const add = new Setting(additionalContainer)
            .setName("Adicionar condição")
            .setDesc("Estas condições ficam disponíveis para aplicar nas criaturas.")
            .addButton((button: ButtonComponent): ButtonComponent => {
                let b = button
                    .setTooltip("Adicionar condição")
                    .setButtonText("+")
                    .onClick(async () => {
                        const modal = new StatusModal(this.plugin);
                        modal.onClose = async () => {
                            if (modal.canceled) return;
                            if (!modal.status.name) return;
                            if (
                                this.plugin.data.statuses.filter(
                                    (status) => status.name == modal.status.name
                                )
                            ) {
                                const map = new Map(
                                    [...this.plugin.data.statuses].map((c) => [
                                        c.name,
                                        c
                                    ])
                                );
                                map.set(modal.status.name, modal.status);
                                this.plugin.data.statuses = Array.from(
                                    map.values()
                                );
                            } else {
                                this.plugin.data.statuses.push(modal.status);
                            }
                            await this.plugin.saveSettings();
                            this._displayStatuses(additionalContainer);
                        };
                        modal.open();
                    });

                return b;
            });
        if (!Conditions.every((c) => this.plugin.data.statuses.includes(c))) {
            add.addExtraButton((b) =>
                b
                    .setIcon("reset")
                    .setTooltip("Readicionar condições padrão")
                    .onClick(async () => {
                        this.plugin.data.statuses = Array.from(
                            new Map(
                                [
                                    ...this.plugin.data.statuses,
                                    ...Conditions
                                ].map((c) => [c.name, c])
                            ).values()
                        );
                        await this.plugin.saveSettings();
                        this._displayStatuses(additionalContainer);
                    })
            );
        }
        const additional = additionalContainer.createDiv("additional");
        for (const status of this.plugin.data.statuses) {
            new Setting(additional)
                .setName(
                    createFragment((e) => {
                        const div = e.createDiv("status-name-container");
                        div.createSpan({ text: status.name });

                        div.createDiv("status-metadata-container");
                        if (status.resetOnRound) {
                            setIcon(
                                div.createDiv({
                                    attr: {
                                        "aria-label": "Remover a cada rodada"
                                    }
                                }),
                                "timer-reset"
                            );
                        }
                        if (status.hasAmount) {
                            setIcon(
                                div.createDiv({
                                    attr: {
                                        "aria-label": "Tem valor"
                                    }
                                }),
                                "hash"
                            );
                        }
                    })
                )
                .setDesc(status.description ?? "")
                .addExtraButton((b) =>
                    b.setIcon("pencil").onClick(() => {
                        const modal = new StatusModal(this.plugin, status);
                        modal.onClose = async () => {
                            if (modal.canceled) return;
                            if (!modal.status.name) return;
                            this.plugin.data.statuses.splice(
                                this.plugin.data.statuses.indexOf(status),
                                1,
                                modal.status
                            );
                            if (
                                this.plugin.data.statuses.filter(
                                    (s) => s.name == modal.status.name
                                ).length > 1
                            ) {
                                if (
                                    this.plugin.data.statuses.filter(
                                        (status) =>
                                            status.name == modal.status.name
                                    )
                                ) {
                                    const map = new Map(
                                        this.plugin.data.statuses.map((c) => [
                                            c.name,
                                            c
                                        ])
                                    );
                                    map.set(modal.status.name, modal.status);
                                    this.plugin.data.statuses = Array.from(
                                        map.values()
                                    );
                                }
                            }
                            await this.plugin.saveSettings();
                            this._displayStatuses(additionalContainer);
                        };
                        modal.open();
                    })
                )
                .addExtraButton((b) =>
                    b.setIcon("trash").onClick(async () => {
                        this.plugin.data.statuses =
                            this.plugin.data.statuses.filter(
                                (s) => s.name != status.name
                            );
                        if (this.plugin.data.unconsciousId == status.id) {
                            this.plugin.data.unconsciousId = "Unconscious";
                        }
                        await this.plugin.saveSettings();
                        this._displayStatuses(additionalContainer);
                    })
                )
                .setClass("initiative-status-item");
        }
    }
    private async _displayIntegrations(containerEl: HTMLDetailsElement) {
        containerEl.empty();
        containerEl.ontoggle = () => {
            this.plugin.data.openState.plugin = containerEl.open;
        };
        const summary = containerEl.createEl("summary");
        new Setting(summary).setHeading().setName("Integrações com plugins");
        summary.createDiv("collapser").createDiv("handle");
        if (!this.plugin.canUseStatBlocks) {
            this.plugin.data.sync = false;
            await this.plugin.saveSettings();
        }
        new Setting(containerEl)
            .setName("Sincronizar criaturas do Fantasy Statblocks")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "As criaturas salvas no plugin Fantasy Statblocks ficam disponíveis para uso."
                    });
                    if (!this.plugin.canUseStatBlocks) {
                        e.createEl("br");
                        e.createEl("br");
                        e.createSpan({
                            text: "Instale e ative o plugin "
                        });
                        e.createEl("a", {
                            text: "Fantasy Statblocks",
                            href: "obsidian://show-plugin?id=obsidian-5e-statblocks"
                        });
                        e.createSpan({
                            text: " para usar as criaturas dele."
                        });
                    }
                })
            )
            .addToggle((t) => {
                t.setDisabled(!this.plugin.canUseStatBlocks).setValue(
                    this.plugin.data.sync
                );
                t.onChange(async (v) => {
                    this.plugin.data.sync = v;
                    await this.plugin.saveSettings();
                    this._displayIntegrations(containerEl);
                });
            });
        if (this.plugin.data.sync) {
            const synced = new Setting(containerEl).setDesc(
                `${this.plugin.bestiary.length} creatures synced.`
            );
            synced.settingEl.addClass("initiative-synced");
            setIcon(synced.nameEl, "check-in-circle");
            synced.nameEl.appendChild(createSpan({ text: "Sincronizado" }));
        }

        new Setting(containerEl)
            .setName("Fórmula de iniciativa")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "Fórmula usada para calcular a iniciativa. Use "
                    });
                    e.createEl("code", { text: "%mod%" });
                    e.createSpan({
                        text: " no lugar do modificador."
                    });
                    if (!this.plugin.canUseDiceRoller) {
                        e.createEl("br");
                        e.createEl("br");
                        e.createSpan({
                            attr: {
                                style: `color: var(--text-error);`
                            },
                            text: "Requer o plugin "
                        });
                        e.createEl("a", {
                            text: "Dice Roller",
                            href: "https://github.com/valentine195/obsidian-dice-roller",
                            cls: "external-link"
                        });
                        e.createSpan({
                            attr: {
                                style: `color: var(--text-error);`
                            },
                            text: " para alterar."
                        });
                    }
                })
            )
            .addText((t) => {
                if (!this.plugin.canUseDiceRoller) {
                    t.setDisabled(true);
                    this.plugin.data.initiative = "1d20 + %mod%";
                }
                t.setValue(this.plugin.data.initiative);
                t.onChange((v) => {
                    this.plugin.data.initiative = v;
                });
                t.inputEl.onblur = async () => {
                    tracker.roll(this.plugin);
                    await this.plugin.saveSettings();
                };
            });
    }
}

class NewPlayerModal extends Modal {
    player: HomebrewCreature;
    saved: boolean;
    constructor(
        private plugin: InitiativeTracker,
        private original: HomebrewCreature = {}
    ) {
        super(plugin.app);
        this.player = { ...(original ?? {}) };
    }
    async display(load?: boolean) {
        let { contentEl } = this;

        contentEl.addClass("initiative-tracker-add-player-modal");

        contentEl.empty();

        let error = false;

        contentEl.createEl("h2", {
            text: this.original ? "Editar jogador" : "Novo jogador"
        });

        new Setting(contentEl)
            .setName("Vincular a uma nota")
            .setDesc("Vincula o jogador a uma nota do vault.")
            .addText((t) => {
                t.setValue(this.player.note ?? "");

                let files = this.app.vault.getFiles();
                const modal = new FileInputSuggest(this.app, t, files);
                modal.onSelect(async ({ item: file }) => {
                    if (!file) return;
                    const metaData = this.app.metadataCache.getFileCache(file);

                    this.player.note = file.basename;
                    this.player.path = file.path;
                    this.player.name = file.basename;

                    if (!metaData || !metaData.frontmatter) return;
                    const { ac, hp, modifier, level, name } =
                        metaData.frontmatter;
                    this.player.name = name ?? this.player.name;
                    this.player.ac = parseInt(ac ?? this.player.ac, 10);
                    this.player.hp = parseInt(hp ?? this.player.hp, 10);
                    this.player.level = parseInt(
                        level ?? this.player.level,
                        10
                    );
                    this.player.modifier = parseInt(
                        modifier ?? this.player.modifier,
                        10
                    );
                    this.player["statblock-link"] =
                        metaData.frontmatter["statblock-link"];
                    this.display();
                });
            });

        let nameInput: InputValidate,
            levelInput: InputValidate,
            hpInput: InputValidate,
            modInput: InputValidate;

        new Setting(contentEl)
            .setName("Nome")
            .setDesc("Nome do jogador. Precisa ser único.")
            .addText((t) => {
                nameInput = {
                    input: t.inputEl,
                    validate: (i: HTMLInputElement) => {
                        let error = false;
                        if (
                            (!i.value.length && !load) ||
                            (this.plugin.players.has(i.value) &&
                                this.player.name != this.original.name)
                        ) {
                            i.addClass("has-error");
                            error = true;
                        }
                        return error;
                    }
                };
                t.setValue(this.player.name ?? "");
                t.onChange((v) => {
                    t.inputEl.removeClass("has-error");
                    this.player.name = v;
                });
            });
        new Setting(contentEl)
            .setName("Nível")
            .setDesc("Nível do jogador.")
            .addText((t) => {
                levelInput = {
                    input: t.inputEl,
                    validate: (i: HTMLInputElement) => {
                        let error = false;
                        if (isNaN(Number(i.value)) || Number(i.value) <= 0) {
                            i.addClass("has-error");
                            error = true;
                        }
                        return error;
                    }
                };
                t.setValue(`${this.player.level ?? ""}`);
                t.onChange((v) => {
                    t.inputEl.removeClass("has-error");
                    this.player.level = Number(v);
                });
            });
        new Setting(contentEl).setName("Pontos de Vida máximos").addText((t) => {
            hpInput = {
                input: t.inputEl,
                validate: (i: HTMLInputElement) => {
                    let error = false;
                    if (isNaN(Number(i.value))) {
                        i.addClass("has-error");
                        error = true;
                    }
                    return error;
                }
            };
            t.setValue(`${this.player.hp ?? ""}`);
            t.onChange((v) => {
                t.inputEl.removeClass("has-error");
                this.player.hp = Number(v);
            });
        });
        new Setting(contentEl).setName("Classe de Armadura").addText((t) => {
            t.setValue(`${this.player.ac ?? ""}`);
            t.onChange((v) => {
                this.player.ac = v;
            });
        });
        new Setting(contentEl)
            .setName("Modificador de iniciativa")
            .setDesc("É somado às iniciativas roladas.")
            .addText((t) => {
                modInput = {
                    input: t.inputEl,
                    validate: (i) => {
                        let error = false;
                        if (isNaN(Number(i.value))) {
                            t.inputEl.addClass("has-error");
                            error = true;
                        }
                        return error;
                    }
                };
                t.setValue(`${this.player.modifier ?? ""}`);
                t.onChange((v) => {
                    this.player.modifier = Number(v);
                });
            });

        let footerEl = contentEl.createDiv();
        let footerButtons = new Setting(footerEl);
        footerButtons.addButton((b) => {
            b.setTooltip("Salvar")
                .setIcon("checkmark")
                .onClick(async () => {
                    let error = this.validateInputs(
                        nameInput,
                        hpInput,
                        modInput
                    );
                    if (error) {
                        new Notice("Corrija os erros antes de salvar.");
                        return;
                    }
                    this.saved = true;
                    this.close();
                });
            return b;
        });
        footerButtons.addExtraButton((b) => {
            b.setIcon("cross")
                .setTooltip("Cancelar")
                .onClick(() => {
                    this.saved = false;
                    this.close();
                });
            return b;
        });

        this.validateInputs(nameInput, hpInput, modInput);
    }
    validateInputs(...inputs: InputValidate[]) {
        let error = false;
        for (let input of inputs) {
            if (input.validate(input.input)) {
                error = true;
            } else {
                input.input.removeClass("has-error");
            }
        }
        return error;
    }
    onOpen() {
        this.display(true);
    }
}

import { App, ButtonComponent, Modal } from "obsidian";
import { tracker } from "src/tracker/stores/tracker";
import { getId } from "src/utils/creature";

export async function confirmWithModal(
    app: App,
    text: string,
    buttons: { cta: string; secondary: string } = {
        cta: "Sim",
        secondary: "Não"
    }
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const modal = new ConfirmModal(app, text, buttons);
        modal.onClose = () => {
            resolve(modal.confirmed);
        };
        modal.open();
    });
}

export class ConfirmModal extends Modal {
    constructor(
        app: App,
        public text: string,
        public buttons: { cta: string; secondary: string }
    ) {
        super(app);
    }
    confirmed: boolean = false;
    async display() {
        new Promise((resolve) => {
            this.contentEl.empty();
            this.contentEl.addClass("confirm-modal");
            this.contentEl.createEl("p", {
                text: this.text
            });
            const buttonEl = this.contentEl.createDiv(
                "fantasy-calendar-confirm-buttons"
            );
            new ButtonComponent(buttonEl)
                .setButtonText(this.buttons.cta)
                .setCta()
                .onClick(() => {
                    this.confirmed = true;
                    this.close();
                });
            new ButtonComponent(buttonEl)
                .setButtonText(this.buttons.secondary)
                .onClick(() => {
                    this.close();
                });
        });
    }
    onOpen() {
        this.display();
    }
}
addIcon(
    "initiative-tracker-warning",
    `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="exclamation-triangle" class="svg-inline--fa fa-exclamation-triangle fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg>`
);

class StatusModal extends Modal {
    status: Condition = { name: null, description: null, id: getId() };
    canceled = false;
    editing: boolean = false;
    original: string;
    constructor(public plugin: InitiativeTracker, status?: Condition) {
        super(plugin.app);
        if (status) {
            this.editing = true;
            this.original = status.name;
            this.status = {
                name: status.name,
                description: status.description,
                id: status.id ?? getId()
            };
        }
    }
    warned = false;
    onOpen() {
        this.titleEl.setText(this.editing ? "Editar condição" : "Nova condição");
        this.contentEl.empty();
        const name = new Setting(this.contentEl)
            .setName("Nome")
            .addText((t) => {
                t.setValue(this.status.name).onChange((v) => {
                    this.status.name = v;
                    if (
                        this.plugin.data.statuses.find(
                            (s) => s.name == this.status.name
                        ) &&
                        !this.warned &&
                        this.original != this.status.name
                    ) {
                        this.warned = true;
                        name.setDesc(
                            createFragment((e) => {
                                const container = e.createDiv(
                                    "initiative-tracker-warning"
                                );
                                setIcon(
                                    container,
                                    "initiative-tracker-warning"
                                );
                                container.createSpan({
                                    text: "Já existe uma condição com este nome; ela será substituída."
                                });
                            })
                        );
                    } else if (this.warned) {
                        this.warned = false;
                        name.setDesc("");
                    }
                });
            });
        new Setting(this.contentEl).setName("Descrição").addTextArea((t) => {
            t.setValue(this.status.description).onChange(
                (v) => (this.status.description = v)
            );
        });
        new Setting(this.contentEl)
            .setName("Remover a cada rodada")
            .setDesc(
                "Esta condição é removida de todas as criaturas no início de cada rodada."
            )
            .addToggle((t) =>
                t
                    .setValue(this.status.resetOnRound)
                    .onChange((v) => (this.status.resetOnRound = v))
            );
        new Setting(this.contentEl)
            .setName("Tem valor")
            .setDesc(
                "Esta condição tem um valor que pode subir ou descer durante o combate."
            )
            .addToggle((t) =>
                t.setValue(this.status.hasAmount).onChange((v) => {
                    this.status.hasAmount = v;
                    this.onOpen();
                })
            );
        if (this.status.hasAmount) {
            new Setting(this.contentEl)
                .setName("Valor inicial")
                .setDesc("A condição começa com este valor ao ser adicionada.")
                .addText(
                    (t) =>
                        (t
                            .setValue(`${this.status.startingAmount}`)
                            .onChange((v) => {
                                this.status.amount =
                                    this.status.startingAmount = Number(v);
                            }).inputEl.type = "number")
                );
        }

        new ButtonComponent(
            this.contentEl.createDiv("initiative-tracker-cancel")
        )
            .setButtonText("Cancelar")
            .onClick(() => {
                this.canceled = true;
                this.close();
            });
    }
}

class PartyModal extends Modal {
    party: Party = { name: null, players: [] };
    canceled = false;
    editing = false;
    warned = false;
    original: string;
    constructor(public plugin: InitiativeTracker, party?: Party) {
        super(plugin.app);
        if (party) {
            this.editing = true;
            this.original = party.name;
            this.party = {
                name: party.name,
                players: [...(party.players ?? [])]
            };
        }
    }
    onOpen(): void {
        this.titleEl.setText(
            this.editing ? `Editar ${this.party.name ?? "grupo"}` : "Novo grupo"
        );

        const name = new Setting(this.contentEl)
            .setName("Nome")
            .addText((t) => {
                t.setValue(this.party.name).onChange((v) => {
                    this.party.name = v;
                    if (
                        this.plugin.data.parties.find(
                            (s) => s.name == this.party.name
                        ) &&
                        !this.warned &&
                        this.original != this.party.name
                    ) {
                        this.warned = true;
                        name.setDesc(
                            createFragment((e) => {
                                const container = e.createDiv(
                                    "initiative-tracker-warning"
                                );
                                setIcon(
                                    container,
                                    "initiative-tracker-warning"
                                );
                                container.createSpan({
                                    text: "Já existe um grupo com este nome; ele será substituído."
                                });
                            })
                        );
                    } else if (this.warned) {
                        this.warned = false;
                        name.setDesc("");
                    }
                });
            });

        const playersEl = this.contentEl.createDiv(
            "initiative-tracker-additional-container"
        );
        let playerText: TextComponent;
        new Setting(playersEl)
            .setName("Adicionar jogador ao grupo")
            .addText((t) => {
                playerText = t;
                const modal = new PlayerSuggestionModal(this.plugin.app, t, [
                    ...this.plugin.players.values()
                ]).onSelect(({ item }) => {
                    t.setValue(item.name);
                    modal.close();
                });
            })
            .addExtraButton((b) =>
                b.setIcon("plus-with-circle").onClick(() => {
                    if (!playerText.getValue() || !playerText.getValue().length)
                        return;
                    if (this.party.players.includes(playerText.getValue())) {
                        new Notice("Esse jogador já está neste grupo.");
                        return;
                    }
                    if (!this.plugin.players.has(playerText.getValue())) {
                        new Notice(
                            "Esse jogador não existe. Crie-o antes."
                        );
                        return;
                    }
                    this.party.players.push(playerText.getValue());
                    this.displayPlayers(playersDisplayEl);
                    playerText.setValue("");
                })
            );
        const playersDisplayEl = playersEl.createDiv("additional");
        this.displayPlayers(playersDisplayEl);

        new ButtonComponent(
            this.contentEl.createDiv("initiative-tracker-cancel")
        )
            .setButtonText("Cancelar")
            .onClick(() => {
                this.canceled = true;
                this.close();
            });
    }
    displayPlayers(containerEl: HTMLDivElement) {
        containerEl.empty();
        if (this.party.players.length) {
            for (const player of this.party.players) {
                new Setting(containerEl).setName(player).addExtraButton((b) => {
                    b.setIcon("trash").onClick(() => {
                        this.party.players.splice(
                            this.party.players.indexOf(player),
                            1
                        );
                        this.displayPlayers(containerEl);
                    });
                });
            }
        } else {
            containerEl
                .createDiv({
                    attr: {
                        style: "display: flex; justify-content: center; padding-bottom: 18px;"
                    }
                })
                .createSpan({
                    text: "Adicione um jogador ao grupo para vê-lo aqui."
                });
        }
    }
}
