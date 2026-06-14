import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sentinel for "All" — large enough that slice(..., ALL_VALUE) returns the whole list
// and back-ends cap to max gracefully.
export const ALL_VALUE = Number.MAX_SAFE_INTEGER;

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100, 500, ALL_VALUE],
}: Props) {
  // Include current pageSize if it's not one of the standard options
  // (e.g., backend returns a limit of 20 that isn't in the dropdown).
  const mergedOptions = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const goto = (p: number) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    if (clamped !== page) onPageChange(clamped);
  };

  // Build page number list with ellipsis: [1, ..., p-1, p, p+1, ..., last]
  const buildPages = (): (number | 'gap')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'gap')[] = [1];
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) pages.push('gap');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('gap');
    pages.push(totalPages);
    return pages;
  };

  const pages = buildPages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
      {/* Info + page size selector */}
      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
        <span>
          {total === 0 ? (
            'No results'
          ) : (
            <>
              Showing <span className="font-semibold text-slate-900">{start}</span>
              {'–'}
              <span className="font-semibold text-slate-900">{end}</span>
              {' of '}
              <span className="font-semibold text-slate-900">{total}</span>
            </>
          )}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-slate-200 bg-card px-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {mergedOptions.map((s) => (
                <option key={s} value={s}>
                  {s === ALL_VALUE ? 'All' : s}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => goto(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-card text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p, idx) =>
            p === 'gap' ? (
              <span
                key={`gap-${idx}`}
                className="h-9 w-9 flex items-center justify-center text-slate-400 text-sm"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goto(p)}
                aria-current={p === page ? 'page' : undefined}
                className={
                  p === page
                    ? 'h-9 min-w-9 px-3 flex items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-sm'
                    : 'h-9 min-w-9 px-3 flex items-center justify-center rounded-lg border border-slate-200 bg-card text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors'
                }
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goto(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-card text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
