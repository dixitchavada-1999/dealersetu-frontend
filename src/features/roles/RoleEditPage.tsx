import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import RolePermissionPanel from '../../components/RolePermissionPanel';

/** Thin page for super-admin "New Role" + role deep-links.
 *  Day-to-day editing happens inline on the Modules & Permissions page. */
export default function RoleEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const isNew = !params.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/roles')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Back to modules"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ShieldCheck size={26} className="text-primary-600" />{isNew ? 'New Role' : 'Role'}</h1>
      </div>
      <RolePermissionPanel roleId={params.id} isNew={isNew} showBasicInfo onSaved={(r) => { if (isNew) navigate(`/roles/${r.id}`); }} />
    </div>
  );
}
