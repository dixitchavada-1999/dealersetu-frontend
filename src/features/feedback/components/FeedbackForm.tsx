import { useState } from 'react';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { feedbackApi, extractError } from '../../../lib/api';
import Card from '../../../components/ui/Card';
import StarRating from '../../../components/ui/StarRating';
import { TextArea } from '../../../components/ui/FormField';
import toast from '../../../lib/toast';

/** Customer-facing "send feedback" form (rating + comment). */
export default function FeedbackForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await feedbackApi.create({ type: 'general', rating, comment: comment.trim() || undefined });
      toast.success('Thank you for your feedback!');
      setRating(0);
      setComment('');
      onSubmitted();
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card padding="lg" className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-primary-600" />
        <h2 className="text-lg font-semibold text-slate-900">Send Feedback</h2>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Rating *</label>
        <StarRating rating={rating} size={28} onChange={setRating} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Comment</label>
        <TextArea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Tell us what you think..." />
      </div>
      <button onClick={handleSubmit} disabled={submitting || rating === 0} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm shadow-sm">
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Submit Feedback
      </button>
    </Card>
  );
}
