<script lang="ts">
    import { ExtraButtonComponent, TextComponent, setIcon } from "obsidian";
    import type InitiativeTracker from "src/main";
    import { REMOVE, TAG } from "src/utils";
    import { ConditionSuggestionModal } from "src/utils/suggester";
    import { getContext } from "svelte";
    import { getId } from "src/utils/creature";
    import Status from "src/tracker/ui/creatures/Status.svelte";

    import { tracker } from "../stores/tracker";
    const { updating, updateTarget } = tracker;
    import { writable } from "svelte/store";
    import type { Condition } from "src/types/creatures";

    const plugin = getContext<InitiativeTracker>("plugin");
    // Percepção, CD de Percepção e idiomas cadastrados no jogador (Configurações, Jogadores).
    const infoJogador = (nome: string) => {
        const p = plugin.data.players.find((j) => j.name === nome);
        if (!p) return "";
        const sinal = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
        return [
            [p.ancestry, p.characterClass].filter(Boolean).join(" "),
            p.playerName ? `Jogador: ${p.playerName}` : "",
            p.perception != null ? `Percepção ${sinal(p.perception)}` : "",
            p.perceptionDC != null ? `CD de Percepção ${p.perceptionDC}` : "",
            p.languages ? `Idiomas: ${p.languages}` : ""
        ]
            .filter(Boolean)
            .join("  |  ");
    };
    // Ícones "i": toque ou clique mostra a explicação (o balão do mouse não existe no iPad).
    let ajudaPV = false;
    let ajudaCondicao = false;
    const infoIcon = (node: HTMLElement) => {
        setIcon(node, "info");
    };
    const tagIcon = (node: HTMLElement) => {
        setIcon(node, TAG);
    };
    let statusBtn: ExtraButtonComponent;
    const addStatusIcon = (node: HTMLElement) => {
        statusBtn = new ExtraButtonComponent(node).setIcon("plus-circle");
    };
    const removeIcon = (node: HTMLElement) => {
        setIcon(node, REMOVE);
    };
    let damage: string = "";
    let ac: string = "";
    let status: string = null;
    $: {
        if (statusBtn) statusBtn.setDisabled(!status);
    }
    const statuses = writable<Condition[]>([]);
    const addStatus = () => {
        if (status) {
            $statuses = [
                ...$statuses,
                {
                    ...(plugin.data.statuses.find((s) => s.name == status) ?? {
                        name: status,
                        id: getId(),
                        description: ""
                    })
                }
            ];
            status = null;
            modal.items = plugin.data.statuses
                .filter((s) => !$statuses.find((a) => a.id == s.id))
                .map((s) => s.name);
            conditionText.setValue("");
        }
    };

    let modal: ConditionSuggestionModal;
    let conditionText: TextComponent;
    const conditionDiv = (node: HTMLElement) => {
        conditionText = new TextComponent(node);
        conditionText.onChange((v) => (status = v));
        node.onkeydown = (evt) => {
            if (evt.key === "Enter") {
                status ? addStatus() : performUpdate(true);
        }};
        createModal();
    };
    const createModal = () => {
        modal = new ConditionSuggestionModal(
            plugin.app,
            conditionText,
            plugin.data.statuses
                .filter((s) => !$statuses.find((a) => a.id == s.id))
                .map((s) => s.name)
        );
        modal.onSelect(async ({ item }) => {
            status = item;
            conditionText.setValue(item);

            modal.close();
            addStatus();
        });
    };
    function init(el: HTMLInputElement, target: "hp" | "ac") {
        if ($updateTarget == target) el.focus();
    }
    const performUpdate = (perform: boolean) => {
        if (perform) {
            tracker.doUpdate(damage ?? "", $statuses, ac);
        } else {
            tracker.clearUpdate();
        }

        damage = null;
        status = null;
        ac = null;
        $statuses = [];
        modal = null;

        $updateTarget = null;

        return;
    };
</script>

{#if $updating.size}
    <div class="updating-container">
        <div class="selecionadas">
            {#each [...$updating.keys()] as creature}
                <strong>
                    {creature.name + (creature.number ? " " + creature.number : "")}
                </strong>
                {#if creature.player && infoJogador(creature.name)}
                    <span class="info-jogador">{infoJogador(creature.name)}</span>
                {/if}
            {/each}
        </div>
        {#if $updateTarget == "hp"}
            <div class="updating-hp">
                <!-- svelte-ignore a11y-autofocus -->
                <div class="hp-status">
                    <div class="input">
                        <strong
                            class="rotulo-campo"
                            aria-label="Número = dano (12). Com - na frente = cura (-8). Com t = PV temporários (t5). Com m = dano nos PV máximos (m10; m-10 aumenta)."
                            >PV</strong
                        >
                        <input
                            type="text"
                            class="campo-pv"
                            bind:value={damage}
                            on:keydown={function (evt) {
                                if (evt.key == "Tab") {
                                    return true;
                                }
                                if (evt.key == "Enter" || evt.key == "Escape") {
                                    performUpdate(evt.key == "Enter");
                                    return;
                                }
                                if (
                                    !/^((t|m)?-?\d*\.?\d*(Backspace|Delete|Arrow\w+)?)$/.test(
                                        this.value + evt.key
                                    )
                                ) {
                                    evt.preventDefault();
                                    return false;
                                }
                            }}
                            use:init={"hp"}
                        />
                        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                        <span
                            class="info-ajuda"
                            use:infoIcon
                            aria-label="Como preencher"
                            on:pointerup={() => (ajudaPV = !ajudaPV)}
                        />
                    </div>
                    {#if ajudaPV}
                        <div class="ajuda">
                            <div><strong>12</strong>: causa 12 de dano</div>
                            <div><strong>-8</strong>: cura 8 PV</div>
                            <div><strong>t5</strong>: dá 5 PV temporários</div>
                            <div><strong>m10</strong>: tira 10 dos PV máximos (m-10 aumenta)</div>
                        </div>
                    {/if}
                </div>
                <div class="hp-status">
                    <div class="input">
                        <div
                            class="rotulo-campo"
                            use:tagIcon
                            aria-label="Aplicar condição às criaturas selecionadas"
                        />
                        <div class="campo-condicao" use:conditionDiv />
                        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                        <span
                            class="info-ajuda"
                            use:infoIcon
                            aria-label="Como aplicar condições"
                            on:pointerup={() => (ajudaCondicao = !ajudaCondicao)}
                        />
                        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                        <span
                            class="info-ajuda"
                            use:addStatusIcon
                            aria-label="Adicionar condição"
                            on:pointerup={addStatus}
                        />
                    </div>
                    {#if ajudaCondicao}
                        <div class="ajuda">
                            Digite a condição e escolha na lista; ela já entra na
                            relação abaixo. Repita para juntar mais de uma. Ao clicar
                            em Aplicar, todas vão para as criaturas selecionadas.
                            <br />O <strong>+</strong> serve para uma condição que não
                            está cadastrada: digite o nome e toque nele para incluí-la
                            avulsa, sem descrição.
                        </div>
                    {/if}
                    {#if $statuses.length}
                        <div class="status-list">
                            <div
                                use:removeIcon
                                aria-label="Limpar lista de condições"
                                style="margin:0.2rem 0.2rem 0rem 0.7rem;cursor:pointer;"
                                on:click={function (evt) {
                                    $statuses = [];
                                }}
                            />
                            <div class="status-list-entries">
                                {#each $statuses as status}
                                    <Status
                                        {status}
                                        on:remove={function (evt) {
                                            $statuses.remove(status);
                                            $statuses = $statuses;
                                        }}
                                    />
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="hp-status">
                {#if plugin.data.beginnerTips}
                    <small class="label"> Definir CA </small>
                {/if}
                <div class="input">
                    <strong
                        class="rotulo-campo"
                        aria-label="Definir ou alterar (+/-) a CA das criaturas"
                        >CA</strong
                    >
                    <input
                        type="text"
                        bind:value={ac}
                        on:focus={function () {
                            // Resolves bug caused by condition select modal not closing
                            modal = null;
                        }}
                        on:keydown={function (evt) {
                            if (evt.key == "Tab") {
                                return true;
                            }
                            if (evt.key == "Enter" || evt.key == "Escape") {
                                performUpdate(evt.key == "Enter");
                                return;
                            }
                        }}
                        use:init={"ac"}
                    />
                </div>
            </div>
        {/if}
    </div>
    <div class="updating-buttons">
        <button on:click={() => performUpdate(false)}>Cancelar</button>
        <button class="mod-cta" on:click={() => performUpdate(true)}>Aplicar</button>
    </div>
{:else}
    <div on:load={() => performUpdate(false)} />
{/if}

<style scoped>
    /* PV e condição: rótulos na mesma coluna e campos da mesma largura */
    .campo-pv,
    .campo-condicao :global(input) {
        width: 12rem;
    }
    .info-ajuda {
        display: inline-flex;
        cursor: pointer;
        color: var(--text-muted);
    }
    .info-ajuda:hover {
        color: var(--text-normal);
    }
    .ajuda {
        margin: 0.25rem 0.7rem 0;
        padding: 0.5rem;
        border-radius: var(--radius-s);
        background-color: var(--background-secondary);
        font-size: var(--font-ui-small);
        color: var(--text-muted);
    }
    .rotulo-campo {
        margin: 0 0.2rem 0 0.7rem;
        width: 1.6rem;
        display: flex;
        justify-content: center;
        text-align: center;
    }
    .input {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    :global(.is-disabled) {
        cursor: not-allowed;
    }
    .input > div {
        display: flex;
        align-items: center;
    }
    .status-list {
        display: flex;
        margin: 0.5rem 0 0.1rem 0;
    }
    .status-list-entries {
        display: flex;
        flex-flow: row wrap;
        column-gap: 0.25rem;
        margin: 0 2rem 0 0.5rem;
    }
    .updating-hp {
        display: flex;
        flex-flow: column;
        gap: 0.5rem;
    }
    .selecionadas {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        text-align: center;
        gap: 0.25rem;
        margin: 0 0.5rem 0.25rem;
    }
    .info-jogador {
        font-size: var(--font-ui-smaller);
        color: var(--text-muted);
    }
    .updating-container {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.5rem;
        /* separa o painel de edição da lista de combatentes */
        border-top: 1px solid var(--background-modifier-border);
        margin-top: 0.75rem;
        padding-top: 0.75rem;
    }
    .hp-status {
        display: flex;
        flex-flow: column;
    }
    .updating-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin: 0.5rem 0.7rem 0 0;
    }
</style>
