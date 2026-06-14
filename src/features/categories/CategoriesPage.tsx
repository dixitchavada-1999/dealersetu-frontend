import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { categoriesApi, extractError } from '../../lib/api';
import type { Category } from '../../lib/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { PageHeader, SearchInput, Button, IconButton, DataTable } from '../../components/ui';
import type { Column } from '../../components/ui';
import CategoryFormModal from './components/CategoryFormModal';
import toast from '../../lib/toast';

/** Categories list — search, paginated table, create/edit/delete. */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = () => {
    setLoading(true);
    categoriesApi.getAll().then(setCategories).catch((e) => toast.error(extractError(e))).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = categories.filter((c) => {
    const term = search.toLowerCase();
    return c.name.toLowerCase().includes(term) || (c.description && c.description.toLowerCase().includes(term));
  });

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize, page]);

  const pageStart = (page - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoriesApi.delete(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Category>[] = [
    {
      header: 'Name',
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><ImageIcon size={16} className="text-slate-400" /></div>
          )}
          <p className="text-sm font-semibold text-slate-900">{c.name}</p>
        </div>
      ),
    },
    { header: 'Description', headerClassName: 'hidden sm:table-cell', cellClassName: 'text-sm text-slate-500 hidden sm:table-cell max-w-xs truncate', render: (c) => c.description || '-' },
    { header: 'Attributes', headerClassName: 'hidden md:table-cell', cellClassName: 'hidden md:table-cell', render: (c) => <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">{c.variantAttributes?.length || 0} attrs</span> },
    {
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(c)} />
          <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(c)} />
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} total categories`}
        actions={<Button icon={Plus} onClick={openCreate}>Add Category</Button>}
      />

      {categories.length > 0 && (
        <div className="mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={search ? 'No results' : 'No categories'} message={search ? 'Try a different search term.' : 'Create your first category to get started.'} />
      ) : (
        <DataTable
          columns={columns}
          rows={paginated}
          rowKey={(c) => c.id}
          pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        />
      )}

      <CategoryFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSaved={load} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} message={`Delete category "${deleteTarget?.name}"? This cannot be undone.`} />
    </div>
  );
}
