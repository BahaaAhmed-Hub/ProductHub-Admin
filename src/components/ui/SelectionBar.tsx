import type { ReactNode } from 'react';

/** The neutral bulk-action bar shown when rows are selected in a table —
 * one shared component so every table's selection bar stays visually
 * consistent (flat, neutral, icon-led — no solid green/red buttons). */
export function SelectionBar({ count, children }: { count: number; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap bg-canvas2 border-[0.5px] border-hairline rounded-control px-3 py-2">
      <span className="text-[12px] font-semibold text-navy mr-0.5">{count} selected</span>
      {children}
    </div>
  );
}
