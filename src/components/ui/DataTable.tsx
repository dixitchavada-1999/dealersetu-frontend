import type { ReactNode } from 'react';
import Pagination from '../Pagination';

export type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Extra classes for the <td> (e.g. responsive hiding, width). */
  cellClassName?: string;
  /** Extra classes for the <th>. */
  headerClassName?: string;
};

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pagination?: PaginationProps;
};

const align = (a?: string) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

/**
 * Generic, column-driven table inside the standard card shell, with an
 * optional pagination footer. Custom cells via each column's `render`.
 */
export default function DataTable<T>({ columns, rows, rowKey, onRowClick, pagination }: Props<T>) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {columns.map((c, i) => (
                <th key={i} className={`px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${align(c.align)} ${c.headerClassName || ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((c, i) => (
                  <td key={i} className={`px-5 py-4 ${align(c.align)} ${c.cellClassName || ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
