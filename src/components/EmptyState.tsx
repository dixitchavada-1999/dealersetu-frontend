import { Inbox } from 'lucide-react';

type Props = {
  title?: string;
  message?: string;
};

export default function EmptyState({ title = 'No data', message = 'Nothing to display yet.' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
        <Inbox size={28} strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium text-slate-500">{title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}
