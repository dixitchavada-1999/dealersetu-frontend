import { FolderTree, Package, Eye } from 'lucide-react';
import type { SACategory, SAProduct, SACustomer, SAOrder } from '../../../../lib/api';
import { fmtDate, fmtCurrency, statusBadge, activeBadge, activeDot } from '../utils';
import TableCard from './TableCard';

const TH = 'text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider';
const TH_R = 'text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider';

const StatusCell = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${activeBadge(active)}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${activeDot(active)}`} />{active ? 'Active' : 'Inactive'}
  </span>
);

const EyeButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <button onClick={onClick} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
);

export function CategoriesTab({ categories, onOpen }: { categories: SACategory[]; onOpen: (c: SACategory) => void }) {
  return (
    <TableCard isEmpty={categories.length === 0} emptyText="No categories found.">
      <thead><tr className="border-b border-slate-100">
        <th className={TH}>Category</th>
        <th className={`${TH} hidden sm:table-cell`}>Description</th>
        <th className={TH}>Status</th>
        <th className={`${TH} hidden md:table-cell`}>Created</th>
        <th className={TH_R}>Details</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-50">
        {categories.map(c => (
          <tr key={c.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => onOpen(c)}>
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center"><FolderTree size={16} className="text-slate-400" /></div>}
                <span className="text-sm font-semibold text-slate-900">{c.name}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell max-w-xs truncate">{c.description || '-'}</td>
            <td className="px-5 py-4"><StatusCell active={c.isActive} /></td>
            <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{fmtDate(c.createdAt)}</td>
            <td className="px-5 py-4 text-right"><EyeButton onClick={e => { e.stopPropagation(); onOpen(c); }} /></td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  );
}

export function ProductsTab({ products, onOpen }: { products: SAProduct[]; onOpen: (id: string) => void }) {
  return (
    <TableCard isEmpty={products.length === 0} emptyText="No products found.">
      <thead><tr className="border-b border-slate-100">
        <th className={TH}>Product</th>
        <th className={`${TH} hidden sm:table-cell`}>Category</th>
        <th className={`${TH} hidden md:table-cell`}>Brand</th>
        <th className={`${TH} hidden lg:table-cell`}>Variants</th>
        <th className={`${TH} hidden lg:table-cell`}>Stock</th>
        <th className={TH}>Status</th>
        <th className={TH_R}>Details</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-50">
        {products.map(p => (
          <tr key={p.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => onOpen(p.id)}>
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center"><Package size={16} className="text-slate-400" /></div>}
                <div><p className="text-sm font-semibold text-slate-900">{p.name}</p>{p.productCode && <p className="text-xs text-slate-400">{p.productCode}</p>}</div>
              </div>
            </td>
            <td className="px-5 py-4 text-sm text-slate-600 hidden sm:table-cell">{p.categoryName || '-'}</td>
            <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{p.brand || '-'}</td>
            <td className="px-5 py-4 text-sm text-slate-600 hidden lg:table-cell">{p.variantCount}</td>
            <td className="px-5 py-4 text-sm text-slate-600 hidden lg:table-cell">{p.totalStock} {p.unit}</td>
            <td className="px-5 py-4"><StatusCell active={p.isActive} /></td>
            <td className="px-5 py-4 text-right"><EyeButton onClick={e => { e.stopPropagation(); onOpen(p.id); }} /></td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  );
}

export function CustomersTab({ customers, onOpen }: { customers: SACustomer[]; onOpen: (c: SACustomer) => void }) {
  return (
    <TableCard isEmpty={customers.length === 0} emptyText="No customers found.">
      <thead><tr className="border-b border-slate-100">
        <th className={TH}>Customer</th>
        <th className={`${TH} hidden sm:table-cell`}>Mobile</th>
        <th className={`${TH} hidden md:table-cell`}>Shop</th>
        <th className={`${TH} hidden lg:table-cell`}>Outstanding</th>
        <th className={TH}>Status</th>
        <th className={TH_R}>Details</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-50">
        {customers.map(c => (
          <tr key={c.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => onOpen(c)}>
            <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{c.name}</p>{c.email && <p className="text-xs text-slate-400">{c.email}</p>}</td>
            <td className="px-5 py-4 text-sm text-slate-600 hidden sm:table-cell">{c.mobile || '-'}</td>
            <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{c.shopName || '-'}</td>
            <td className="px-5 py-4 hidden lg:table-cell"><span className={`text-sm font-medium ${c.outstandingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmtCurrency(c.outstandingAmount)}</span></td>
            <td className="px-5 py-4"><StatusCell active={c.isActive} /></td>
            <td className="px-5 py-4 text-right"><EyeButton onClick={e => { e.stopPropagation(); onOpen(c); }} /></td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  );
}

export function OrdersTab({ orders, onOpen }: { orders: SAOrder[]; onOpen: (id: string) => void }) {
  return (
    <TableCard isEmpty={orders.length === 0} emptyText="No orders found.">
      <thead><tr className="border-b border-slate-100">
        <th className={TH}>Order</th>
        <th className={`${TH} hidden sm:table-cell`}>Customer</th>
        <th className={TH}>Amount</th>
        <th className={`${TH} hidden md:table-cell`}>Payment</th>
        <th className={TH}>Status</th>
        <th className={`${TH} hidden md:table-cell`}>Date</th>
        <th className={TH_R}>Details</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-50">
        {orders.map(o => (
          <tr key={o.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => onOpen(o.id)}>
            <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{o.orderNumber}</p></td>
            <td className="px-5 py-4 hidden sm:table-cell"><p className="text-sm text-slate-700">{o.customerName}</p><p className="text-xs text-slate-400">{o.customerMobile}</p></td>
            <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{fmtCurrency(o.totalAmount)}</p>{o.paidAmount > 0 && <p className="text-xs text-emerald-600">Paid: {fmtCurrency(o.paidAmount)}</p>}</td>
            <td className="px-5 py-4 hidden md:table-cell"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge(o.paymentStatus)}`}>{o.paymentStatus}</span></td>
            <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span></td>
            <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{fmtDate(o.orderDate)}</td>
            <td className="px-5 py-4 text-right"><EyeButton onClick={e => { e.stopPropagation(); onOpen(o.id); }} /></td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  );
}
