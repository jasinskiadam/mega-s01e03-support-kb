// #4471 split into the problems it holds, counted the desk's way (causes.ts): every report under
// the cause its tenant and channel give it. The reports the desk read as a one-day move
// (desk-notes.json) are a problem of their own, but stay counted where they are filed, footnoted.
import { groupByCause, readAs, uniqueById, type CauseGroup, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

export type ProblemRow = { problem: string; reports: number; tenants: number; firstSeen: string; lastSeen: string; filedUnder?: string };

export function splitTicket(reports: Report[], ticket: number, oneDayMove: readonly string[]): ProblemRow[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups: CauseGroup[] = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({ problem: g.cause, reports: g.reports.length, tenants: g.tenants, firstSeen: g.firstSeen, lastSeen: g.lastSeen }));
  for (const g of groups) {
    const moved = g.reports.filter((r) => oneDayMove.includes(r.id));
    if (!readAs(g, oneDayMove)) continue;
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({ problem: 'one-day', reports: moved.length, tenants: new Set(moved.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1], filedUnder: g.cause });
  }
  return rows;
}
