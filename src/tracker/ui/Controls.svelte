<script lang="ts">
    import {
        ExtraButtonComponent,
        type MenuItem,
        Platform,
        Menu
    } from "obsidian";
    import {
        BACKWARD,
        DICE,
        EXPAND,
        FORWARD,
        GROUP,
        NEW,
        PLAY,
        REDO,
        RollPlayerInitiativeBehavior,
        SAVE,
        STOP
    } from "src/utils";
    import { createEventDispatcher, getContext } from "svelte";
    import type InitiativeTracker from "src/main";
    import { tracker } from "../stores/tracker";
    import { confirmWithModal } from "./create/modal";

    const { state, data, logFile, sort, party } = tracker;


    const playButton = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon(PLAY)
            .setTooltip("Iniciar")
            .onClick(() => tracker.setState(true));
    };
    const stopButton = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon(STOP)
            .setTooltip("Parar")
            .onClick(() => tracker.setState(false));
    };
    const nextButton = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon(FORWARD)
            .setTooltip("Próximo")
            .onClick(() => tracker.goToNext());
    };
    const prevButton = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon(BACKWARD)
            .setTooltip("Anterior")
            .onClick(() => tracker.goToPrevious());
    };

    const plugin = getContext<InitiativeTracker>("plugin");

    const dispatch = createEventDispatcher();

    const open = (evt: MouseEvent) => {
        const menu = new Menu();
        menu.addItem((item) => {
            item.setIcon(NEW)
                .setTitle("Novo encontro")
                .onClick(async () => {
                    if (
                        !(await confirmWithModal(
                            plugin.app,
                            "Iniciar um novo encontro? O encontro atual será descartado."
                        ))
                    )
                        return;
                    tracker.new(plugin);
                });
        });
        menu.addItem((item) => {
            item.setIcon(NEW)
                .setTitle("Adicionar criaturas")
                .onClick(() => dispatch("add-creatures"));
        });
        menu.addItem((item) => {
            item.setIcon(REDO)
                .setTitle("Restaurar PV e condições")
                .onClick(async () => {
                    if (
                        await confirmWithModal(
                            plugin.app,
                            "Restaurar PV e condições? Todas as criaturas voltam aos PV máximos e à CA original, perdem todas as condições e as desativadas voltam a ficar ativas."
                        )
                    )
                        tracker.reset();
                });
        });
        menu.addItem((item) => {
            item.setIcon(DICE)
                .setTitle("Rolar iniciativas de novo")
                .onClick(async () => {
                    if (await confirmWithModal(plugin.app, "Rolar as iniciativas de novo? A ordem atual será substituída."))
                        tracker.roll(plugin);
                });
        });
        menu.addItem((item) => {
            item.setIcon(GROUP)
                .setTitle(
                    plugin.data.condense
                        ? "Expandir criaturas"
                        : "Agrupar criaturas"
                )
                .onClick(async () => {
                    plugin.data.condense = !plugin.data.condense;
                    await plugin.saveSettings();
                    item.setIcon(plugin.data.condense ? EXPAND : GROUP);
                    item.setTitle(
                        plugin.data.condense
                            ? "Expandir criaturas"
                            : "Agrupar criaturas"
                    );
                });
        });
        menu.addItem((item) => {
            item.setTitle($sort ? "Ordem crescente" : "Ordem decrescente").onClick(
                async () => {
                    plugin.data.descending = !plugin.data.descending;
                    await plugin.saveSettings();
                    item.setTitle(
                        plugin.data.descending
                            ? "Ordem crescente"
                            : "Ordem decrescente"
                    );
                }
            );
        });
        menu.addSeparator();

        if ($data.parties && $data.parties.length) {
            if (Platform.isMobile) {
                menu.addItem((item) => {
                    /* const partyMenu =  */ item.setIcon("switch")
                        .setTitle("Trocar grupo")
                        .setIsLabel(true);
                });
                menu.addItem((item) => {
                    item.setTitle("Nenhum")
                        .onClick(() => {
                            tracker.setParty("", plugin);
                        })
                        .setChecked(!$party || $party == "");
                });
                for (const p of $data.parties) {
                    menu.addItem((item) => {
                        item.setTitle(p.name)
                            .onClick(() => {
                                tracker.setParty(p.name, plugin);
                            })
                            .setChecked($party == p.name);
                    });
                }
            } else {
                menu.addItem((item) => {
                    const partyMenu = item
                        .setIcon("switch")
                        .setTitle("Trocar grupo")
                        .setSubmenu();
                    partyMenu.addItem((item) => {
                        item.setTitle("Nenhum")
                            .onClick(() => {
                                tracker.setParty("", plugin);
                            })
                            .setChecked(!$party || $party == "");
                    });
                    for (const p of $data.parties) {
                        partyMenu.addItem((item) => {
                            item.setTitle(p.name)
                                .onClick(() => {
                                    tracker.setParty(p.name, plugin);
                                })
                                .setChecked($party == p.name);
                        });
                    }
                });
            }
        }
        if (Platform.isMobile) {
            menu.addItem((item) => {
                item.setIcon("dice")
                    .setTitle("Iniciativa do grupo")
                    .setIsLabel(true);
            });
            menu.addItem((item) => {
                item.setTitle("Sempre rolar")
                    .onClick(async () => {
                        plugin.data.rollPlayerInitiatives =
                            RollPlayerInitiativeBehavior.Always;
                        await plugin.saveSettings();
                    })
                    .setChecked(
                        plugin.data.rollPlayerInitiatives ==
                            RollPlayerInitiativeBehavior.Always
                    );
            });
            menu.addItem((item) => {
                item.setTitle("Nunca rolar")
                    .onClick(async () => {
                        plugin.data.rollPlayerInitiatives =
                            RollPlayerInitiativeBehavior.Never;
                        await plugin.saveSettings();
                    })
                    .setChecked(
                        plugin.data.rollPlayerInitiatives ==
                            RollPlayerInitiativeBehavior.Never
                    );
            });
            menu.addItem((item) => {
                item.setTitle("Definir como zero")
                    .onClick(async () => {
                        plugin.data.rollPlayerInitiatives =
                            RollPlayerInitiativeBehavior.SetToZero;
                        await plugin.saveSettings();
                    })
                    .setChecked(
                        plugin.data.rollPlayerInitiatives ==
                            RollPlayerInitiativeBehavior.SetToZero
                    );
            });
        } else {
            menu.addItem((item) => {
                const partyMenu = item
                    .setIcon("dice")
                    .setTitle("Iniciativa do grupo")
                    .setSubmenu();

                partyMenu.addItem((item) => {
                    item.setTitle("Sempre rolar")
                        .onClick(async () => {
                            plugin.data.rollPlayerInitiatives =
                                RollPlayerInitiativeBehavior.Always;
                            await plugin.saveSettings();
                        })
                        .setChecked(
                            plugin.data.rollPlayerInitiatives ==
                                RollPlayerInitiativeBehavior.Always
                        );
                });
                partyMenu.addItem((item) => {
                    item.setTitle("Nunca rolar")
                        .onClick(async () => {
                            plugin.data.rollPlayerInitiatives =
                                RollPlayerInitiativeBehavior.Never;
                            await plugin.saveSettings();
                        })
                        .setChecked(
                            plugin.data.rollPlayerInitiatives ==
                                RollPlayerInitiativeBehavior.Never
                        );
                });
                partyMenu.addItem((item) => {
                    item.setTitle("Definir como zero")
                        .onClick(async () => {
                            plugin.data.rollPlayerInitiatives =
                                RollPlayerInitiativeBehavior.SetToZero;
                            await plugin.saveSettings();
                        })
                        .setChecked(
                            plugin.data.rollPlayerInitiatives ==
                                RollPlayerInitiativeBehavior.SetToZero
                        );
                });
            });
        }

        menu.addSeparator();
        if (!Platform.isMobile) {
            menu.addItem((item) => {
                const load = item
                    .setIcon("open-elsewhere-glyph")
                    .setTitle("Carregar encontro")
                    .setDisabled(
                        Object.keys(plugin.data.encounters).length == 0
                    )
                    .setSubmenu()
                    .setNoIcon();

                for (const encounter of Object.keys(plugin.data.encounters)) {
                    load.addItem((item) => {
                        item.setTitle(encounter).onClick(() => {
                            tracker.new(
                                plugin,
                                plugin.data.encounters[encounter]
                            );
                        });
                    });
                }
            });
        } else {
            menu.addItem((item) => {
                item.setIcon("open-elsewhere-glyph")
                    .setTitle("Carregar encontro")
                    .setIsLabel(true);
            });
            for (const encounter of Object.keys(plugin.data.encounters)) {
                menu.addItem((item) => {
                    item.setTitle(encounter).onClick(() => {
                        tracker.new(plugin, plugin.data.encounters[encounter]);
                    });
                });
            }
        }
        menu.addItem((item) => {
            item.setIcon(SAVE)
                .setTitle("Salvar encontro")
                .onClick(() => {
                    dispatch("save");
                });
        });

        menu.showAtMouseEvent(evt);
    };

    const menuIcon = (node: HTMLElement) => {
        new ExtraButtonComponent(node).setIcon("vertical-three-dots");
    };
    const playerView = (node: HTMLElement) => {
        new ExtraButtonComponent(node).setIcon("view");
    };
    const logFileButton = (node: HTMLElement) => {
        new ExtraButtonComponent(node).setIcon("file-signature");
    };
    const openLogFile = async () => {
        if ($logFile) {
            const leaf = plugin.app.workspace.getLeaf();
            leaf.openFile($logFile);
        }
    };
</script>

<div class="buttons">
    <div class="state">
        {#if $state}
            <div use:stopButton />
            <div use:prevButton />
            <div use:nextButton />
        {:else}
            <div use:playButton />
        {/if}
    </div>
    <div class="clean">
        {#if $logFile}
            <div
                use:logFileButton
                aria-label="Abrir registro"
                on:click={openLogFile}
            />
        {/if}
        <!-- disponível também no iPad (abre numa aba em vez de janela) -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            use:playerView
            aria-label="Abrir visão dos jogadores"
            on:click={(evt) => dispatch("player-view")}
        />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div use:menuIcon on:click={(evt) => open(evt)} />
    </div>
</div>

<style>
    .buttons {
        display: flex;
        justify-content: space-between;
        padding: 0 0 0.5rem 0;
    }
    .state {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .clean {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .state > *:not(:last-child),
    .clean > *:not(:last-child) {
        margin-right: 0.25rem;
    }
</style>
