import { useMemo, useState } from 'react';
import { Button } from './Button';

export function usePagination<T>(items: T[]) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const total = items.length;
  const start = Math.min(page * pageSize, Math.max(0, total - 1));
  const end = Math.min(start + pageSize, total);
  const pageItems = useMemo(() => items.slice(start, end), [items, start, end]);
  return {
    pageItems,
    pageSize,
    setPageSize: (n: number) => { setPageSize(n); setPage(0); },
    start: total === 0 ? 0 : start + 1,
    end,
    total,
    prevDisabled: page === 0,
    nextDisabled: end >= total,
    prev: () => setPage((p) => Math.max(0, p - 1)),
    next: () => setPage((p) => (((p + 1) * pageSize) < total ? p + 1 : p)),
  };
}

export function PaginationBar({ pag }: { pag: ReturnType<typeof usePagination> }) {
  return (
    <div className="flex justify-between items-center pt-2.5 text-[11.5px] text-body">
      <div className="flex items-center gap-1.5">
        Rows per page:
        <select
          value={pag.pageSize}
          onChange={(e) => pag.setPageSize(Number(e.target.value))}
          className="h-[26px] rounded-control border-[0.5px] border-hairline bg-white text-[11.5px] px-1"
        >
          {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div>Showing {pag.start}–{pag.end} of {pag.total}</div>
      <div className="flex gap-1.5">
        <Button variant="secondary" disabled={pag.prevDisabled} onClick={pag.prev}>Prev</Button>
        <Button variant="secondary" disabled={pag.nextDisabled} onClick={pag.next}>Next</Button>
      </div>
    </div>
  );
}
