import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../../../lib/types';

/** Search + company filter + pagination shared by Products and My Products. */
export function useProductFilters(products: Product[]) {
  const [search, setSearch] = useState('');
  const [filterTenant, setFilterTenant] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const tenantOptions = useMemo(
    () => [...new Map(products.filter(p => p.tenantId).map(p => [p.tenantId, p.tenantName || ''])).entries()],
    [products],
  );

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    if (!p.name.toLowerCase().includes(q) && !(p.productCode || '').toLowerCase().includes(q) && !(p.brand || '').toLowerCase().includes(q)) return false;
    if (filterTenant !== 'all' && p.tenantId !== filterTenant) return false;
    return true;
  }), [products, search, filterTenant]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize, page]);

  const pageStart = (page - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  return {
    search, setSearch, filterTenant, setFilterTenant,
    page, setPage, pageSize, setPageSize,
    tenantOptions, filtered, paginated,
  };
}
