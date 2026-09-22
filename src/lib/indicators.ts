/**
 * Flattens every figure in content.json into one sortable table, so the
 * Indicators panel and the CSV export read from a single derivation rather than
 * each re-walking the file.
 */
import type { Content, Lang } from './shared/content-types';
import { formatValue, sourceById } from './shared/content';

export type IndicatorGroup = 'economy' | 'human' | 'tiif' | 'regions';

export interface IndicatorRow {
  id: string;
  group: IndicatorGroup;
  label: string;
  value: number;
  display: string;
  source: string;
  asOf: string;
}

export function buildIndicators(content: Content, lang: Lang): IndicatorRow[] {
  const rows: IndicatorRow[] = [];

  const push = (
    group: IndicatorGroup,
    id: string,
    label: string,
    value: number,
    sourceId: string,
    prefix?: string,
    suffix?: string,
  ) => {
    rows.push({
      id: `${group}:${id}`,
      group,
      label,
      value,
      display: `${prefix ?? ''}${formatValue(value, lang)}${suffix ?? ''}`,
      source: sourceId,
      asOf: sourceById(content, sourceId)?.accessed ?? '',
    });
  };

  for (const kpi of content.economy_2025.kpis) {
    push('economy', kpi.id, kpi.label[lang], kpi.value, content.economy_2025.source, kpi.prefix, kpi.suffix);
  }
  for (const kpi of content.human_capital.kpis) {
    push('human', kpi.id, kpi.label[lang], kpi.value, content.human_capital.source, kpi.prefix, kpi.suffix);
  }
  for (const stat of content.tiif_2026.stats) {
    push('tiif', stat.id, stat.label[lang], stat.value, content.tiif_2026.source, stat.prefix, stat.suffix);
  }
  for (const region of content.regions.items) {
    push('regions', region.id, region[lang], region.avg_salary, content.regions.source, '', '');
  }

  return rows;
}

/** RFC 4180 quoting: a value containing a quote, comma or newline gets wrapped. */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(rows: IndicatorRow[], headers: string[]): string {
  const lines = [headers.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push([row.label, String(row.value), row.group, row.source, row.asOf].map(csvCell).join(','));
  }
  // BOM so Excel opens the Cyrillic and Uzbek Latin text correctly.
  return '﻿' + lines.join('\r\n') + '\r\n';
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
