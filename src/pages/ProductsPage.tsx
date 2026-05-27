import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/validation';

const pageSizes = [10, 20, 50];

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchProducts(page, limit, search);

      // response.data is Product[]
      setProducts(response.data ?? []);

      // response.pagination.pages is total number of pages
      setTotalPages(response.pagination?.pages ?? 1);
    } catch (error) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, limit]);

  const handleSearch = async () => {
    setPage(1);
    await loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully.');
      loadProducts();
    } catch (error) {
      toast.error('Unable to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Products</h2>
          <p className="mt-1 text-sm text-slate-500">Browse and manage items in your inventory.</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Add product
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus-within:ring-2 focus-within:ring-primary-100 sm:w-72">
              <span className="text-slate-400">Search</span>
              <input
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
                placeholder="Product name or SKU"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Search
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Results per page
            <select
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">SKU</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">Quantity</th>
              <th className="px-4 py-4">Owner</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading products…
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-4 font-medium text-slate-900">{product.name}</td>
                  <td className="px-4 py-4 text-slate-500">{product.sku}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {formatCurrency(Number(product.price))}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{product.quantity}</td>
                  <td className="px-4 py-4 text-slate-500">
                    {product.creator?.firstName ?? 'You'}
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No products match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((page) => Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((page) => Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
