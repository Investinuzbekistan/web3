<script lang="ts">
  /**
   * The overview's map cell held a heading, a sentence and a button, and was
   * otherwise a white void two rows tall. It now shows the real choropleth at
   * small size — same data, same sequential ramp, no labels — which both fills
   * the cell and tells the visitor what the map panel actually contains.
   */
  import { app, setPanel } from '../lib/state.svelte';
  import { projectRegions, shadeFor } from '../lib/map';

  const WIDTH = 520;
  const HEIGHT = 290;

  const regions = $derived(app.content?.regions);
  const salaries = $derived(regions ? regions.items.map((r) => r.avg_salary) : []);
  const min = $derived(salaries.length ? Math.min(...salaries) : 0);
  const max = $derived(salaries.length ? Math.max(...salaries) : 1);
  const byId = $derived(new Map(regions?.items.map((r) => [r.id, r.avg_salary]) ?? []));
  const paths = $derived(projectRegions(app.geo, WIDTH, HEIGHT));
</script>

{#if paths.length}
  <button
    type="button"
    class="minimap"
    onclick={() => setPanel('map')}
    aria-label="{app.t.nav.map}: {app.t.map.legend}"
  >
    <svg viewBox="0 0 {WIDTH} {HEIGHT}" aria-hidden="true">
      {#each paths as region (region.id)}
        <path d={region.d} fill={shadeFor(byId.get(region.id), min, max)} />
      {/each}
    </svg>
  </button>
{/if}

<style>
  .minimap {
    display: block;
    width: 100%;
    margin-block: 0.75rem 1rem;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  .minimap svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .minimap path {
    stroke: var(--paper);
    stroke-width: 1;
    transition: opacity 0.15s;
  }
  .minimap:hover path {
    opacity: 0.85;
  }
</style>
