import { useEffect, useState } from 'react';
import { Plus, ImageIcon, Loader2 } from 'lucide-react';
import { bannersApi, extractError } from '../../lib/api';
import type { Banner } from '../../lib/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import { PageHeader, Button } from '../../components/ui';
import toast from '../../lib/toast';
import BannerCard from './components/BannerCard';
import BannerFormModal from './components/BannerFormModal';

/** Promotions — banner grid with create/edit (image/video) + delete. */
export default function PromotionsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = async () => {
    try {
      const data = await bannersApi.getAll();
      setBanners((Array.isArray(data) ? data : []).sort((a, b) => (b.priority || 0) - (a.priority || 0)));
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (b: Banner) => { setEditing(b); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await bannersApi.delete(deleteId);
      toast.success('Banner deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <PageHeader title="Promotions" subtitle={`${banners.length} banners`} actions={<Button icon={Plus} onClick={openCreate}>Add Banner</Button>} />

      {banners.length === 0 ? (
        <div className="bg-card rounded-xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><ImageIcon size={24} className="text-slate-400" /></div>
          <h3 className="text-lg font-semibold text-slate-700">No banners yet</h3>
          <p className="text-sm text-slate-400 mt-1">Create your first promotional banner.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.slice((page - 1) * pageSize, page * pageSize).map((b) => (
              <BannerCard key={b.id} banner={b} onEdit={openEdit} onDelete={setDeleteId} />
            ))}
          </div>
          <Pagination page={page} pageSize={pageSize} total={banners.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        </>
      )}

      <BannerFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSaved={load} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} isLoading={deleting} title="Delete Banner" message="Are you sure? This cannot be undone." />
    </div>
  );
}
