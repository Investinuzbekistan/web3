<script lang="ts">
  import { app } from '../lib/state.svelte';
  import { formatDate, sourceById } from '../lib/shared/content';

  let { id }: { id: string | undefined } = $props();

  const source = $derived(app.content && id ? sourceById(app.content, id) : undefined);
  const accessed = $derived(source ? formatDate(source.accessed, app.lang) : '');
</script>

{#if source}
  <a
    class="source num"
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="{source.id} — {app.t.sources.label}: {source.title}. {app.t.sources.asOf(accessed)}"
    title="{source.title} — {app.t.sources.asOf(accessed)}"
  >
    {source.id}
  </a>
{/if}

<style>
  .source {
    display: inline-block;
    padding: 0 0.25rem;
    border: 1px solid var(--rule);
    border-radius: 2px;
    font-size: 0.625rem;
    line-height: 1.4;
    color: var(--ink-3);
    text-decoration: none;
    vertical-align: 1px;
  }
  .source:hover,
  .source:focus-visible {
    border-color: var(--accent);
    color: var(--accent-text);
  }
</style>
