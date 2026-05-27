import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService } from '@/services/productService';
import { CreateProductRequest, UpdateProductRequest } from '@/types';
import { isValidPrice, isValidQuantity, getErrorMessage } from '@/utils/validation';

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  sku: '',
};

export const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState<CreateProductRequest & { description: string }>({
    ...emptyForm,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await productService.fetchProductById(id);
        if (response.data) {
          setForm({
            name: response.data.name,
            description: response.data.description || '',
            price: response.data.price,
            quantity: response.data.quantity,
            sku: response.data.sku,
          });
        }
      } catch (error) {
        toast.error('Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return toast.error('Product name is required.');
    }

    if (!form.sku.trim()) {
      return toast.error('Product SKU is required.');
    }

    if (!isValidPrice(form.price)) {
      return toast.error('Enter a valid price greater than 0.');
    }

    if (!isValidQuantity(form.quantity)) {
      return toast.error('Quantity must be a non-negative integer.');
    }

    setSaving(true);

    try {
      if (id) {
        const payload: UpdateProductRequest = {
          name: form.name,
          description: form.description,
          price: form.price,
          quantity: form.quantity,
          sku: form.sku,
        };
        await productService.updateProduct(id, payload);
        toast.success('Product updated successfully.');
      } else {
        const payload: CreateProductRequest = {
          name: form.name,
          description: form.description || undefined,
          price: form.price,
          quantity: form.quantity,
          sku: form.sku,
        };
        await productService.createProduct(payload);
        toast.success('Product created successfully.');
      }
      navigate('/products');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {id ? 'Edit product' : 'Create a new product'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Maintain accurate inventory and keep product details up to date.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Back to products
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Loading product…
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Product name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Redis Cache Module"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">SKU</span>
                <input
                  value={form.sku}
                  onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="REDIS-001"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="mt-2 min-h-[140px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="Add optional product details here..."
              />
            </label>

            <div className="grid gap-6 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Price</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="0.00"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Quantity</span>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="0"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving…' : id ? 'Update product' : 'Create product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
