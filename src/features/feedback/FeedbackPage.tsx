import { Fragment, useEffect, useState } from 'react';
import { Loader2, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { feedbackApi, extractError } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Feedback as FeedbackType, FeedbackType as FeedbackFilterType } from '../../lib/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { PageHeader, StarRating } from '../../components/ui';
import { formatLongDate } from '../../lib/format';
import toast from '../../lib/toast';
import FeedbackForm from './components/FeedbackForm';

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  order: { bg: 'bg-blue-50', text: 'text-blue-700' },
  product: { bg: 'bg-violet-50', text: 'text-violet-700' },
  general: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

const TABS: { label: string; value: FeedbackFilterType | '' }[] = [
  { label: 'All', value: '' }, { label: 'Order', value: 'order' }, { label: 'Product', value: 'product' }, { label: 'General', value: 'general' },
];

/** Feedback — customer submit form OR admin list with inline replies. */
export default function FeedbackPage() {
  const { isCustomer } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeedbackFilterType | ''>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (p = page) => {
    setLoading(true);
    try {
      if (isCustomer) {
        const list = await feedbackApi.getMy();
        setFeedback(list);
        setPagination({ page: 1, limit: 100, total: list.length, pages: 1 });
      } else {
        const res = await feedbackApi.getAll(filter || undefined, p);
        setFeedback(res.feedback);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setLoading(false);
  };

  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter, page]);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const updated = await feedbackApi.adminReply(id, replyText.trim());
      setFeedback((prev) => prev.map((f) => (f.id === id ? updated : f)));
      setReplyText('');
      toast.success('Reply sent');
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setReplying(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await feedbackApi.delete(deleteTarget.id);
      setFeedback((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Feedback deleted');
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setDeleting(false);
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); setReplyText(''); }
    else { setExpandedId(id); setReplyText(feedback.find((f) => f.id === id)?.adminReply || ''); }
  };

  if (loading && feedback.length === 0) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <PageHeader title="Feedback" subtitle={isCustomer ? 'Share your experience' : `${pagination.total} total feedback entries`} />

      {isCustomer && <FeedbackForm onSubmitted={() => load(1)} />}

      <div className="flex gap-2 mb-5">
        {TABS.map((tab) => (
          <button key={tab.value} onClick={() => setFilter(tab.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === tab.value ? 'bg-primary-600 text-white shadow-lg' : 'bg-card border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{tab.label}</button>
        ))}
      </div>

      {feedback.length === 0 ? (
        <EmptyState title="No feedback" message="No feedback entries found for this filter." />
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Comment</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {feedback.map((f) => {
                  const style = TYPE_STYLES[f.type] || TYPE_STYLES.general;
                  const isExpanded = expandedId === f.id;
                  return (
                    <Fragment key={f.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => toggleExpand(f.id)}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-900">{f.userName || 'Unknown'}</p>
                          {f.type === 'order' && f.orderNumber && <p className="text-xs text-slate-400">Order #{f.orderNumber}</p>}
                          {f.type === 'product' && f.productName && <p className="text-xs text-slate-400">{f.productName}</p>}
                        </td>
                        <td className="px-5 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${style.bg} ${style.text}`}>{f.type}</span></td>
                        <td className="px-5 py-4"><div className="flex items-center gap-2"><StarRating rating={f.rating} /><span className="text-xs text-slate-500 font-medium">{f.rating}/5</span></div></td>
                        <td className="px-5 py-4 hidden md:table-cell"><p className="text-sm text-slate-600 truncate max-w-xs">{f.comment || '-'}</p></td>
                        <td className="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell">{formatLongDate(f.createdAt)}</td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => toggleExpand(f.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                            <button onClick={() => setDeleteTarget(f)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-5 py-4 bg-slate-50/50">
                            <div className="space-y-3 max-w-2xl">
                              {f.comment && <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Comment</p><p className="text-sm text-slate-700 leading-relaxed">{f.comment}</p></div>}
                              {f.adminReply && (
                                <div className="bg-primary-50 border border-primary-100 rounded-xl p-3">
                                  <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">Admin Reply</p>
                                  <p className="text-sm text-primary-700">{f.adminReply}</p>
                                  {f.adminRepliedAt && <p className="text-[10px] text-primary-400 mt-1">{formatLongDate(f.adminRepliedAt)}</p>}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{f.adminReply ? 'Update Reply' : 'Reply'}</p>
                                <div className="flex gap-2">
                                  <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleReply(f.id); }} placeholder="Type your reply..." className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                                  <button onClick={() => handleReply(f.id)} disabled={replying || !replyText.trim()} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 shrink-0">{replying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Send</button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={pagination.page} pageSize={pagination.limit} total={pagination.total} onPageChange={setPage} />
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} message={`Delete this feedback from "${deleteTarget?.userName || 'Unknown'}"?`} />
    </div>
  );
}
