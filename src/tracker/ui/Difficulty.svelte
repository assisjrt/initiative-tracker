<script lang="ts">
    import { setIcon } from "obsidian";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { getContext } from "svelte";
    import { getRpgSystem } from "src/utils";
    import type { RpgSystem } from "src/utils/rpg-system/rpgSystem";
    import type InitiativeTracker from "src/main";

    import { tracker } from "../stores/tracker";
    const { difficulty, party } = tracker;

    const plugin: InitiativeTracker = getContext("plugin");

    const dif = difficulty(plugin);

    const difficultyBar = tweened(0, {
        duration: 400,
        easing: cubicOut
    });

    $: {
        if ($dif.thresholds.last().minValue > 0) {
            difficultyBar.set(
                Math.min(
                    $dif.difficulty.value / $dif.thresholds.last().minValue,
                    1
                )
            );
        }
    }
    $: summary = $dif.difficulty.summary;
    // Toque ou clique no ícone "i" mostra a legenda (o balão do mouse não existe no iPad).
    let mostrarLegenda = false;
    const infoIcon = (node: HTMLElement) => setIcon(node, "info");
</script>

{#if $dif.difficulty.displayName}
    <div class="difficulty-level {$dif.difficulty.cssClass}">
        Nível do encontro:
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <span
            class="info-legenda"
            use:infoIcon
            aria-label="Mostrar limites de XP"
            on:pointerup={() => (mostrarLegenda = !mostrarLegenda)}
        />
        <strong>{$dif.difficulty.displayName}</strong>
    </div>
{/if}
<div class="difficulty-bar-container" aria-label={summary}>
    <span>{$dif.labels?.[0] ?? ""}</span>
    <span
        ><meter
            class="difficulty-bar"
            min="0"
            low="0.33"
            high="0.66"
            optimum="0"
            value={$difficultyBar}
        /></span
    >
    <span>{$dif.labels?.last() ?? ""}</span>
</div>
{#if mostrarLegenda && summary}
    <div class="legenda">
        {#each summary.split("\n") as linha}
            <div>{linha}</div>
        {/each}
    </div>
{/if}
<div class="difficulty-level grupo">Grupo: <strong>{$party || "Nenhum"}</strong></div>

<style>
    .difficulty-level {
        padding: 0 0.5rem;
        margin-bottom: 0.25rem;
        text-align: center;
    }
    .grupo {
        margin-top: -0.25rem;
        margin-bottom: 0.5rem;
    }
    .legenda {
        margin: -0.25rem 0.5rem 0.5rem;
        padding: 0.5rem;
        border-radius: var(--radius-s);
        background-color: var(--background-secondary);
        font-size: var(--font-ui-small);
        text-align: center;
    }
    .info-legenda {
        display: inline-flex;
        vertical-align: middle;
        cursor: pointer;
        color: var(--text-muted);
    }
    .info-legenda:hover {
        color: var(--text-normal);
    }
    .difficulty-bar-container {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.5rem;
        align-items: center;
        padding: 0 0.5rem;
        margin-bottom: 0.5rem;
        width: 100%;
    }
    .difficulty-bar {
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 3px;
    }
</style>
