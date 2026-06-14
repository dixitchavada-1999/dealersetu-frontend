import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { extractError } from '../../lib/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { PageHeader, SearchInput, Button, IconButton, DataTable } from '../../components/ui';
import type { Column } from '../../components/ui';
import toast from '../../lib/toast';
import type { TeamConfig, TeamMember, TeamMemberInput } from './types';
import TeamMemberFormModal from './components/TeamMemberFormModal';

/** Generic staff-management page — driven by a per-team {@link TeamConfig}. */
export default function TeamManagementPage({ config }: { config: TeamConfig }) {
  const { noun, title, emptyMessage, api } = config;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = () => {
    setLoading(true);
    api.list().then(setMembers).catch((e) => toast.error(extractError(e))).finally(() => setLoading(false));
  };
  // Reload when the team (config) changes — e.g. navigating Dispatch → Production.
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [api]);

  const filtered = members.filter((m) => {
    const term = search.toLowerCase();
    return `${m.firstName} ${m.lastName}`.toLowerCase().includes(term) || m.email.toLowerCase().includes(term);
  });

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize, page]);

  const pageStart = (page - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setModalOpen(true); };

  const handleSubmit = async (data: TeamMemberInput) => {
    if (editing) {
      await api.update(editing.id, data);
      toast.success(`${noun} updated`);
    } else {
      await api.create(data);
      toast.success(`${noun} created`);
    }
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.remove(deleteTarget.id);
      toast.success(`${noun} deleted`);
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<TeamMember>[] = [
    {
      header: 'Name',
      render: (m) => (
        <>
          <p className="text-sm font-semibold text-slate-900">{m.firstName} {m.lastName}</p>
          <p className="text-xs text-slate-400 sm:hidden">{m.email}</p>
        </>
      ),
    },
    { header: 'Email', headerClassName: 'hidden sm:table-cell', cellClassName: 'text-sm text-slate-600 hidden sm:table-cell', render: (m) => m.email },
    { header: 'Mobile', headerClassName: 'hidden md:table-cell', cellClassName: 'text-sm text-slate-500 hidden md:table-cell', render: (m) => m.mobileNumber || '-' },
    {
      header: 'Status',
      headerClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell',
      render: (m) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${m.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {m.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cellClassName: 'whitespace-nowrap',
      render: (m) => (
        <div className="flex items-center justify-end gap-0.5">
          <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(m)} />
          <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(m)} />
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={`${members.length} team member${members.length !== 1 ? 's' : ''}`}
        actions={<Button icon={Plus} onClick={openCreate}>Add {noun}</Button>}
      />

      {members.length > 0 && (
        <div className="mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={search ? 'No results' : `No ${noun.toLowerCase()}s`} message={search ? 'Try a different search term.' : emptyMessage} />
      ) : (
        <DataTable
          columns={columns}
          rows={paginated}
          rowKey={(m) => m.id}
          pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        />
      )}

      <TeamMemberFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editing={editing} noun={noun} onSubmit={handleSubmit} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} message={`Delete ${noun.toLowerCase()} "${deleteTarget?.firstName} ${deleteTarget?.lastName}"?`} />
    </div>
  );
}
