<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { splitTicket } from '#lib/kb/split';
  import { uniqueById, type Report } from '#lib/kb/causes';

  // tickets: problem → link to the ticket filed for it.
  // status: problem → what engineering did with it.
  let { ticket, tickets = {}, status = {} }: { ticket: number; tickets?: Record<string, string>; status?: Record<string, string> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const rows = $derived(splitTicket(reports as Report[], ticket, notes.oneDayMove));
  const ticketNo = (href: string) => `#${href.split('/').pop()}`;
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} · <strong>{rows.length}</strong> problems
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>status</th></tr></thead>
  <tbody>
    {#each rows as r (r.problem)}
      <tr>
        <td><code>{r.problem}</code></td>
        <td>{r.reports}{#if r.filedUnder}<sup>*</sup>{/if}</td>
        <td>{r.tenants}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td>{#if tickets[r.problem]}<a href={tickets[r.problem]}>{ticketNo(tickets[r.problem])}</a>{:else}none yet{/if}</td>
        <td>{status[r.problem] ?? 'open'}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each rows.filter((r) => r.filedUnder) as r (r.problem)}
  <p class="note"><sup>*</sup> {r.reports} reports read as a one-day move; counted under <code>{r.filedUnder}</code>, where the desk files them by tenant.</p>
{/each}

<style>
  .sum { font-size: 1.05rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
