import type { ReactNode } from 'react';

type Props = {
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
};

/** Card wrapper for a tenant tab's data table, with a centered empty state. */
export default function TableCard({ isEmpty, emptyText, children }: Props) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {isEmpty ? (
        <div className="text-center py-12"><p className="text-sm text-slate-500">{emptyText}</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">{children}</table>
        </div>
      )}
    </div>
  );
}
