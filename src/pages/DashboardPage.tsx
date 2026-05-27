import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { formatCurrency, formatDate } from '@/utils/validation';

export const DashboardPage = () => {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [myResponse, lowStockResponse] = await Promise.all([
          productService.fetchMyProducts(),
          productService.fetchLowStock(10),
        ]);

        setMyProducts(myResponse.data || []);
        setLowStock(lowStockResponse.data || []);
      } catch (error) {
        toast.error('Unable to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">My products</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{myProducts.length}</p>
          <p className="mt-2 text-sm text-slate-500">Products created by your account.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Low stock</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{lowStock.length}</p>
          <p className="mt-2 text-sm text-slate-500">Products with quantity below threshold.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Inventory value</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">
            {formatCurrency(
              myProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)
            )}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Estimated value of your dashboard inventory.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Low stock products</h2>
            <p className="mt-1 text-sm text-slate-500">
              Monitor products that need restocking soon.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Loading dashboard…
          </div>
        ) : lowStock.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {lowStock.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-4 py-4 text-slate-500">{product.sku}</td>
                    <td className="px-4 py-4 text-slate-700">{product.quantity}</td>
                    <td className="px-4 py-4 text-slate-500">{formatDate(product.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No low stock products found.
          </div>
        )}
      </section>
    </div>
  );
};
