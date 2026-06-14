import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, RotateCcw, Loader2 } from 'lucide-react';
import { userApi, extractError } from '../../lib/api';
import type { UserMember } from '../../lib/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { PageHeader, SearchInput, Button, IconButton, DataTable } from '../../components/ui';
import type { Column } from '../../components/ui';
import CustomerFormModal from './components/CustomerFormModal';
import toast from '../../lib/toast';

/** Customers list — search, paginated table, CRUD + device-lock reset. */
export default function CustomersPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<UserMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = () => {
    setLoading(true);
    userApi.getMembers().then(setMembers).catch((e) => toast.error(extractError(e))).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = members.filter((m) => `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) || m.mobileNumber.includes(search));

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize, page]);

  const pageStart = (page - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (m: UserMember) => { setEditing(m); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userApi.deleteMember(deleteTarget.id);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleResetDevice = async (m: UserMember) => {
    try {
      const res: any = await userApi.resetDevice(m.id);
      const newCode = res?.loginCode;
      toast.success(newCode ? `Device reset. New login code: ${newCode}` : 'Device lock reset', newCode ? { duration: 10000 } : undefined);
      load();
    } catch (err: any) {
      toast.error(extractError(err));
    }
  };

  const columns: Column<UserMember>[] = [
    {
      header: 'Name',
      render: (m) => (
        <>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{m.firstName} {m.lastName}</p>
            {(m.discount ?? 0) > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] font-bold text-red-600">{m.discount}% OFF</span>}
          </div>
          <p className="text-xs text-slate-400 sm:hidden">{m.mobileNumber}</p>
        </>
      ),
    },
    { header: 'Mobile', headerClassName: 'hidden sm:table-cell', cellClassName: 'text-sm text-slate-600 hidden sm:table-cell', render: (m) => m.mobileNumber },
    { header: 'Shop', headerClassName: 'hidden md:table-cell', cellClassName: 'text-sm text-slate-500 hidden md:table-cell', render: (m) => m.shopName || '-' },
    { header: 'Login Code', headerClassName: 'hidden lg:table-cell', cellClassName: 'hidden lg:table-cell', render: (m) => <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-mono font-medium text-slate-600">{m.loginCode}</span> },
    {
      header: 'Status',
      headerClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell',
      render: (m) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${m.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {m.isActive ? 'Active' : 'Inactive'}
          </span>
          {m.isDeviceLocked && <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 text-xs font-medium text-amber-700">Locked</span>}
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cellClassName: 'whitespace-nowrap',
      render: (m) => (
        <div className="flex items-center justify-end gap-0.5">
          <IconButton icon={Eye} label="View" onClick={() => navigate(`/customers/${m.id}`)} />
          <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(m)} />
          {(m.isDeviceLocked || !m.loginCode) && <IconButton icon={RotateCcw} label={m.isDeviceLocked ? 'Reset device & regenerate code' : 'Regenerate login code'} onClick={() => handleResetDevice(m)} />}
          <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(m)} />
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${members.length} total customers`} actions={<Button icon={Plus} onClick={openCreate}>Add Customer</Button>} />

      {members.length > 0 && (
        <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search customers..." /></div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={search ? 'No results' : 'No customers'} message={search ? 'Try a different search.' : 'Add your first customer.'} />
      ) : (
        <DataTable
          columns={columns}
          rows={paginated}
          rowKey={(m) => m.id}
          pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        />
      )}

      <CustomerFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSaved={load} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} message={`Delete customer "${deleteTarget?.firstName} ${deleteTarget?.lastName}"?`} />
    </div>
  );
}
