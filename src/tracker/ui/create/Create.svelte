<script lang="ts">
    import {
        ButtonComponent,
        ExtraButtonComponent,
        Notice,
        ToggleComponent,
        TextComponent,
        Platform
    } from "obsidian";

    import { onMount } from "svelte";

    import { DICE } from "src/utils";
    import { SRDMonsterSuggestionModal } from "src/utils/suggester";
    import { Creature } from "src/utils/creature";
    import type InitiativeTracker from "src/main";
    import type { Writable } from "svelte/store";
    import { equivalent } from "src/encounter";
    import { confirmWithModal } from "./modal";

    let creature: Creature = new Creature({});
    export let amount = 1;
    export let plugin: InitiativeTracker;
    export let adding: Writable<Array<[Creature, number]>>;
    export let editing: Writable<Creature>;
    export let isEditing: boolean;

    editing.subscribe((c) => {
        if (!c) return;
        creature = c;
    });

    $: {
        if (Platform.isMobile) {
            $adding.splice(0, 1, [creature, amount]);
        }
    }

    let modifier = JSON.stringify(creature.modifier ?? 0);
    const prior = modifier;
    // O campo Modificador é texto: acompanha a criatura sempre que ela é trocada
    // (escolhida no bestiário, aberta para edição ou limpa), senão mostra e grava o valor antigo.
    // Detalhe da última rolagem (dado + modificador), mostrado apagado no campo Iniciativa.
    let detalheIniciativa = "";
    const rolarIniciativa = async () => {
        const total = await plugin.getInitiativeValue(creature.modifier);
        creature.initiative = total;
        const mod = [creature.modifier ?? 0].flat().reduce((a, b) => a + Number(b), 0);
        detalheIniciativa = isNaN(mod)
            ? ""
            : `${total - mod} ${mod < 0 ? "−" : "+"} ${Math.abs(mod)}`;
    };
    // PV fixo e PV sorteado se excluem: com PV preenchido, Dados de vida e Rolar PV ficam bloqueados e vazios.
    const pvFixo = (c: Creature) => Number(c?.hp) > 0;
    const podeRolarPV = (c: Creature) => !pvFixo(c) && !!c?.hit_dice?.trim();
    $: if (pvFixo(creature) && (creature.hit_dice || creature.rollHP)) {
        creature.hit_dice = "";
        creature.rollHP = false;
    }
    // Com Dados de vida, o PV fica vazio (mostra "Sorteado pelos dados de vida" no lugar do 0).
    $: if (creature.hit_dice?.trim() && creature.hp === 0) creature.hp = null;
    // Rolar PV não é escolha: fica ligado sempre que há Dados de vida (e PV vazio).
    $: if (!!creature.rollHP !== podeRolarPV(creature))
        creature.rollHP = podeRolarPV(creature);
    let modificadorDe = creature;
    $: if (creature !== modificadorDe) {
        modificadorDe = creature;
        modifier = JSON.stringify(creature.modifier ?? 0);
    }
    const saveButton = (node: HTMLElement) => {
        new ButtonComponent(node)
            .setButtonText("Adicionar")
            .onClick(async () => {
                if (!creature || !creature.name || !creature.name?.length) {
                    new Notice("Informe um nome.");
                    return;
                }
                if (!pvFixo(creature) && !podeRolarPV(creature)) {
                    new Notice("Informe os PV ou os Dados de vida.");
                    return;
                }
                try {
                    creature.modifier = JSON.parse(`${modifier}`);
                } catch (e) {
                    console.warn(
                        "Initiative Tracker: modificador da criatura em formato inválido."
                    );
                    creature.modifier = JSON.parse(prior);
                }
                if (!creature.modifier) {
                    creature.modifier = JSON.parse(prior);
                }
                if (
                    (Array.isArray(creature.modifier) &&
                        !creature.modifier.every((m) => !isNaN(Number(m)))) ||
                    isNaN(Number(creature.modifier))
                ) {
                    console.warn(
                        "Initiative Tracker: modificador da criatura não é numérico."
                    );
                    creature.modifier = 0;
                }
                if (
                    creature.initiative <= 0 ||
                    creature.initiative == null ||
                    isNaN(creature.initiative)
                ) {
                    creature.initiative = await plugin.getInitiativeValue(
                        creature.modifier
                    );
                }

                let existing = $adding.findIndex(([k]) =>
                    equivalent(k, creature)
                );
                if (existing > -1) {
                    $adding[existing][1] += amount;
                } else {
                    $adding.push([creature, amount]);
                }
                $adding = $adding;
                $editing = null;
                creature = new Creature({});
                detalheIniciativa = "";
            });
    };
    const editButton = (node: HTMLElement) => {
        new ButtonComponent(node)
            .setButtonText("Salvar alterações")
            .onClick(async () => {
                if (!creature || !creature.name || !creature.name?.length) {
                    new Notice("Informe um nome.");
                    return;
                }
                try {
                    creature.modifier = JSON.parse(`${modifier}`);
                } catch (e) {
                    creature.modifier = 0;
                }
                if (!creature.modifier) {
                    creature.modifier = 0;
                }
                if (
                    creature.initiative <= 0 ||
                    creature.initiative == null ||
                    isNaN(creature.initiative)
                ) {
                    creature.initiative = await plugin.getInitiativeValue(
                        creature.modifier
                    );
                }
                let existing = $adding.findIndex(
                    ([k]) => k != creature && equivalent(k, creature)
                );
                if (
                    existing > -1 &&
                    (await confirmWithModal(
                        app,
                        `Isto vai juntar ${creature.name} com ${$adding[existing][0].name}.`
                    ))
                ) {
                    const index = $adding.findIndex(([k]) => k == creature);
                    $adding[existing][1] += $adding[index][1];
                    $adding.splice(index, 1);
                }
                $adding = $adding;
                $editing = null;
                creature = new Creature({});
                detalheIniciativa = "";
            });
    };
    const cancelButton = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setTooltip("Limpar campos")
            .setIcon("x")
            .onClick(() => {
                creature = new Creature({});
                detalheIniciativa = "";
            });
    };
    const diceButton = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon(DICE)
            .setTooltip("Rolar iniciativa")
            .onClick(rolarIniciativa);
    };
    let nameInput: TextComponent, displayNameInput: HTMLInputElement;
    const name = (node: HTMLElement) => {
        nameInput = new TextComponent(node)
            .setValue(creature.name)
            .onChange((v) => (creature.name = v));
    };
    let modal: SRDMonsterSuggestionModal;
    const createModal = () => {
        modal = new SRDMonsterSuggestionModal(
            plugin.app,
            nameInput,
            plugin.bestiary
        );
        modal.onSelect(async (selected) => {
            if (selected.item) {
                creature = Creature.from(selected.item);
                modificadorDe = creature;
                modifier = JSON.stringify(creature.modifier ?? 0);
                await rolarIniciativa();
                nameInput.setValue(creature.name);
            }
            modal.close();
        });
    };

    onMount(() => {
        if (isEditing) {
            setImmediate(() => {
                displayNameInput.focus();
                createModal();
            });
        } else {
            createModal();
        }
    });
    const hideToggle = (div: HTMLDivElement) => {
        new ToggleComponent(div)
            .setValue(creature.hidden)
            .onChange((v) => (creature.hidden = v));
    };
    const staticToggle = (div: HTMLDivElement) => {
        new ToggleComponent(div)
            .setValue(creature.static)
            .onChange((v) => (creature.static = v));
    };
    const friendToggle = (div: HTMLDivElement) => {
        new ToggleComponent(div)
            .setValue(creature.friendly)
            .onChange((v) => (creature.friendly = v));
    };
</script>

<div class="initiative-tracker-editor">
    <div class="create-new">
        <div aria-label="Nome da criatura. Digite para buscar no bestiário do Fantasy Statblocks; ao escolher, PV, CA e modificador são preenchidos.">
            <label for="add-name">Criatura</label>
            <div use:name id="add-name" />
        </div>
        <div aria-label="Opcional. Nome mostrado no rastreador e na visão dos jogadores no lugar do nome da criatura (ex.: Goblin ferido).">
            <label for="add-display">Nome exibido</label>
            <input
                bind:value={creature.display}
                bind:this={displayNameInput}
                id="add-display"
                type="text"
                name="display"
                tabindex="0"
            />
        </div>
        <div aria-label="Pontos de Vida máximos da criatura. Bloqueado quando Dados de vida estiver preenchido.">
            <label for="add-hp" class:desativado={!!creature.hit_dice?.trim()}>PV</label>
            <input
                bind:value={creature.hp}
                id="add-hp"
                disabled={!!creature.hit_dice?.trim()}
                placeholder={creature.hit_dice?.trim() ? "Sorteado pelos dados de vida" : ""}
                type="number"
                name="hp"
                tabindex="0"
            />
        </div>
        <div aria-label="Fórmula para sortear os PV (ex.: 2d8+4). Se preenchida, os PV são sorteados ao entrar no encontro. Só disponível com PV vazio ou zero. No Pathfinder 2e, deixe vazio.">
            <label for="hit-dice" class:desativado={pvFixo(creature)}>Dados de vida</label>
            <input
                bind:value={creature.hit_dice}
                id="hit-dice"
                type="text"
                disabled={pvFixo(creature)}
                placeholder={pvFixo(creature) ? "PV já preenchido" : "ex.: 2d8+4"}
                name="hitdice"
                tabindex="0"
            />
        </div>
        <div aria-label="Classe de Armadura da criatura.">
            <label for="add-ac">CA</label>
            <input
                bind:value={creature.ac}
                on:change={() => (creature.dirty_ac = true)}
                id="add-ac"
                name="ac"
                type="text"
                tabindex="0"
            />
        </div>
        <div aria-label="Bônus de iniciativa, somado à rolagem do dado. No Pathfinder 2e, normalmente a Percepção.">
            <label for="add-mod">Modificador</label>
            <input
                bind:value={modifier}
                id="add-mod"
                type="text"
                name="add-mod"
                tabindex="0"
            />
        </div>

        <div class="initiative" aria-label="Valor da iniciativa. Se ficar vazio ou em zero, é rolado ao adicionar; o dado rola agora.">
            <label for="add-init">Iniciativa</label>
            <input
                bind:value={creature.initiative}
                on:input={() => (detalheIniciativa = "")}
                id="add-init"
                type="number"
                name="initiative"
                tabindex="0"
            />
            {#if detalheIniciativa}
                <span class="detalhe-iniciativa" aria-label="Dado + modificador"
                    >{detalheIniciativa}</span
                >
            {/if}
            <div class="dice" use:diceButton />
        </div>

        {#key creature}
            <div aria-label="Mantém este valor quando as iniciativas forem roladas de novo.">
                <label for="add-mod">Iniciativa fixa</label>
                <div use:staticToggle />
            </div>
            <div aria-label="Esconde a criatura da visão dos jogadores até você revelá-la.">
                <label for="add-mod">Oculta</label>
                <div use:hideToggle />
            </div>
            <div aria-label="Criatura do lado do grupo: ganha um ícone de aliada e não conta na dificuldade do encontro.">
                <label for="add-mod">Aliada</label>
                <div use:friendToggle />
            </div>
        {/key}

        <div class="amount" aria-label="Quantas cópias desta criatura entram no encontro.">
            <label for="add-init">Quantidade</label>
            <input
                bind:value={amount}
                id="add-init"
                type="number"
                name="initiative"
                tabindex="0"
            />
        </div>
    </div>
    {#if !isEditing && !Platform.isMobile}
        <div class="context-buttons">
            <div use:cancelButton class="add-button cancel-button" />
            {#if $editing}
                <div class="add-button" use:editButton />
            {:else}
                <div class="add-button" use:saveButton />
            {/if}
        </div>
    {/if}
</div>

<style>
    .create-new > * {
        display: grid;
        grid-template-columns: 7rem minmax(0, 1fr);
        column-gap: 0.5rem;
        align-items: center;
        min-height: 2.25rem;
        margin-bottom: 0.5rem;
    }
    .create-new label {
        white-space: nowrap;
    }
    .create-new label.desativado {
        color: var(--text-faint);
    }
    .create-new input,
    .create-new :global(#add-name input) {
        width: 100%;
        box-sizing: border-box;
    }
    .context-buttons {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        grid-gap: 0.125rem;
    }
    .cancel-button {
        color: var(--text-faint);
    }

    .initiative {
        position: relative;
    }
    .initiative > .detalhe-iniciativa {
        position: absolute;
        right: 2.25rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-faint);
        font-size: var(--font-ui-small);
        pointer-events: none;
    }
    .initiative > .dice {
        position: absolute;
        right: 0.25rem;
        top: 50%;
        transform: translateY(-50%);
    }
</style>
