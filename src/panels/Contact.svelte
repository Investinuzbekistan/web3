<script lang="ts">
  /** Contacts with copy buttons, the TIIF 2026 card, a compact form, and the footer. */
  import SourceTag from '../components/SourceTag.svelte';
  import { app, tr } from '../lib/state.svelte';
  import { formatDate, formatDateRange, formatValue } from '../lib/shared/content';

  const org = $derived(app.content?.organization);
  const tiif = $derived(app.content?.tiif_2026);

  let name = $state('');
  let email = $state('');
  let message = $state('');
  let errors = $state<{ name?: string; email?: string; message?: string }>({});
  let status = $state<'idle' | 'submitting' | 'sent' | 'failed'>('idle');
  let copied = $state<string | null>(null);

  const hasEndpoint = Boolean(import.meta.env.VITE_FORM_ENDPOINT);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copied = value;
      setTimeout(() => (copied = null), 1800);
    } catch {
      copied = null;
    }
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = app.t.contact.errors.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = app.t.contact.errors.email;
    if (message.trim().length < 10) next.message = app.t.contact.errors.message;
    errors = next;
    if (Object.keys(next).length) return;

    status = 'submitting';
    const endpoint = import.meta.env.VITE_FORM_ENDPOINT;
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name, email, message, lang: app.lang }),
        });
        if (!res.ok) throw new Error(String(res.status));
        status = 'sent';
      } catch {
        status = 'failed';
      }
      return;
    }

    const to = org?.contacts.emails[0] ?? 'uzipa@invest.gov.uz';
    const body = `${app.t.contact.form.name}: ${name}\n${app.t.contact.form.email}: ${email}\n\n${message}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(app.t.actions.send)}&body=${encodeURIComponent(body)}`;
    status = 'sent';
  }
</script>

<section class="panel" aria-labelledby="contact-title">
  <header class="panel__head">
    <h1 id="contact-title">{app.t.contact.title}</h1>
    <p>{app.t.contact.body}</p>
  </header>

  <div class="bento top">
    {#if org}
      <div class="cell contacts">
        <div class="row">
          <span class="label">{app.t.contact.phone}</span>
          <a href={org.contacts.phone_href} class="num">{org.contacts.phone}</a>
          <button type="button" class="chip" onclick={() => copy(org.contacts.phone)}>
            {copied === org.contacts.phone ? app.t.actions.copied : app.t.actions.copy}
          </button>
        </div>
        {#each org.contacts.emails as address (address)}
          <div class="row">
            <span class="label">{app.t.contact.email}</span>
            <a href="mailto:{address}">{address}</a>
            <button type="button" class="chip" onclick={() => copy(address)}>
              {copied === address ? app.t.actions.copied : app.t.actions.copy}
            </button>
          </div>
        {/each}
        <div class="row">
          <span class="label">{app.t.contact.address}</span>
          <span>{tr(org.contacts.address)}</span>
          <a class="chip" href={org.contacts.map_url} target="_blank" rel="noopener noreferrer">
            {app.t.contact.map}
          </a>
        </div>
        <div class="row">
          <span class="label">{app.t.contact.website}</span>
          <a href={org.contacts.website} target="_blank" rel="noopener noreferrer">invest.gov.uz</a>
          <SourceTag id={org.source} />
        </div>
      </div>
    {/if}

    <form class="cell form" onsubmit={submit} novalidate>
      {#if status === 'sent'}
        <p class="sent">{hasEndpoint ? app.t.contact.sentPosted : app.t.contact.sent}</p>
      {:else}
        <label class="field">
          <span>{app.t.contact.form.name}</span>
          <input bind:value={name} type="text" autocomplete="name" aria-invalid={!!errors.name} />
          {#if errors.name}<small role="alert">{errors.name}</small>{/if}
        </label>
        <label class="field">
          <span>{app.t.contact.form.email}</span>
          <input bind:value={email} type="email" autocomplete="email" aria-invalid={!!errors.email} />
          {#if errors.email}<small role="alert">{errors.email}</small>{/if}
        </label>
        <label class="field">
          <span>{app.t.contact.form.message}</span>
          <textarea bind:value={message} rows="4" aria-invalid={!!errors.message}></textarea>
          {#if errors.message}<small role="alert">{errors.message}</small>{/if}
        </label>
        <button type="submit" class="btn" disabled={status === 'submitting'}>
          {status === 'submitting' ? app.t.actions.sending : app.t.actions.send}
        </button>
        {#if status === 'failed'}
          <p class="failed" role="alert">{app.t.contact.failed}</p>
        {/if}
      {/if}
    </form>
  </div>

  {#if tiif}
    <article class="cell cell--quiet tiif">
      <div class="tiif__head">
        <h2>{tr(tiif.name)}</h2>
        <p class="num">
          {app.t.forum.held}: {formatDateRange(tiif.dates, app.lang)} · {tiif.city}
          <SourceTag id={tiif.source} />
        </p>
        <p class="tiif__past">{app.t.forum.past}</p>
      </div>
      <dl class="tiif__stats">
        {#each tiif.stats as stat (stat.id)}
          <div>
            <dd class="value">{stat.prefix ?? ''}{formatValue(stat.value, app.lang)}{stat.suffix ?? ''}</dd>
            <dt>{tr(stat.label)}</dt>
          </div>
        {/each}
      </dl>
      <!-- Names as text only; no third-party logos. -->
      <p class="tiif__orgs">
        {#each tiif.notable_attendees_text_only as orgName (orgName)}<span>{orgName}</span>{/each}
      </p>
      <a href={tiif.official_site} target="_blank" rel="noopener noreferrer">{app.t.forum.site} ↗</a>
    </article>
  {/if}

  {#if app.content}
    <footer class="cell footer">
      <div class="footer__cols">
        <div>
          <span class="label">{app.t.footer.links}</span>
          <ul>
            {#each app.content.useful_links as link (link.url)}
              <li><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a></li>
            {/each}
          </ul>
        </div>
        <div>
          <span class="label">{app.t.sources.title}</span>
          <ol class="sources">
            {#each app.content.sources as source (source.id)}
              <li>
                <span class="num">{source.id}</span>
                <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
                <em class="num">{formatDate(source.accessed, app.lang)}</em>
              </li>
            {/each}
          </ol>
        </div>
      </div>

      {#if app.content.meta.disclaimer_enabled}
        <p class="disclaimer">
          <strong>{app.t.footer.disclaimerTitle}.</strong>
          {app.t.footer.disclaimer}
        </p>
      {/if}
      {#if app.lang === 'ru' && app.content.meta.ru_machine}
        <p class="fine">{app.t.sources.machine}</p>
      {/if}
      <p class="fine">{app.t.footer.geoCredit}</p>
    </footer>
  {/if}
</section>

<style>
  .panel {
    display: grid;
    gap: 1px;
    background: var(--rule);
  }
  .panel__head {
    background: var(--paper);
    padding: clamp(1.25rem, 3vw, 2.25rem);
  }
  .panel__head h1 {
    font-size: clamp(1.4rem, 2.6vw, 2rem);
  }
  .panel__head p {
    margin-top: 0.5rem;
  }

  .top {
    border-inline: 0;
    border-bottom: 0;
    grid-template-columns: minmax(0, 1fr);
  }
  @media (min-width: 52rem) {
    .top {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
  }

  .contacts {
    display: grid;
    gap: 1px;
    align-content: start;
  }
  .row {
    display: grid;
    grid-template-columns: 6rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid var(--rule);
    font-size: 0.875rem;
  }
  .row a {
    overflow-wrap: anywhere;
  }
  .chip {
    text-decoration: none;
  }

  .form {
    display: grid;
    gap: 0.9rem;
    align-content: start;
  }
  .sent {
    color: var(--ink);
  }
  .failed {
    color: #b3261e;
    font-size: 0.8125rem;
  }

  .tiif h2 {
    font-size: 1.125rem;
  }
  .tiif__head p {
    margin-top: 0.4rem;
    font-size: 0.8125rem;
    color: var(--ink-3);
  }
  .tiif__past {
    color: var(--ink-2) !important;
  }
  .tiif__stats {
    margin: 1.25rem 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
    gap: 1rem 0.75rem;
  }
  .tiif__stats div {
    display: grid;
    gap: 0.15rem;
  }
  .tiif__stats dd {
    margin: 0;
    font-size: 1.25rem;
  }
  .tiif__stats dt {
    font-size: 0.75rem;
    color: var(--ink-3);
  }
  .tiif__orgs {
    margin-top: 1.25rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  .tiif__orgs span {
    padding: 0.15rem 0.45rem;
    border: 1px solid var(--rule);
    background: var(--paper);
    font-size: 0.75rem;
    color: var(--ink-3);
  }
  .tiif > a {
    display: inline-block;
    margin-top: 1rem;
    font-size: 0.8125rem;
  }

  .footer__cols {
    display: grid;
    gap: 2rem;
  }
  @media (min-width: 52rem) {
    .footer__cols {
      grid-template-columns: 14rem minmax(0, 1fr);
      gap: 3rem;
    }
  }
  .footer ul,
  .footer ol {
    margin: 0.75rem 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.4rem;
    font-size: 0.8125rem;
  }
  .sources li {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.5rem;
  }
  .sources span {
    color: var(--ink-3);
    font-size: 0.6875rem;
  }
  .sources em {
    grid-column: 2;
    font-style: normal;
    font-size: 0.6875rem;
    color: var(--ink-3);
  }
  .disclaimer {
    margin-top: 2rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--rule);
    font-size: 0.8125rem;
  }
  .disclaimer strong {
    color: var(--ink);
  }
  .fine {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: var(--ink-3);
  }
</style>
