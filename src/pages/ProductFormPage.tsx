import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { productService } from '@/services/productService';
import { CreateProductRequest, UpdateProductRequest } from '@/types';
import { getErrorMessage, isValidPrice, isValidQuantity } from '@/utils/validation';

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
  const [form, setForm] = useState<CreateProductRequest & { description: string }>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

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
      toast.error('Product name is required.');
      return;
    }

    if (!form.sku.trim()) {
      toast.error('Product SKU is required.');
      return;
    }

    if (!isValidPrice(form.price)) {
      toast.error('Enter a valid price greater than 0.');
      return;
    }

    if (!isValidQuantity(form.quantity)) {
      toast.error('Quantity must be a non-negative integer.');
      return;
    }

    setSaving(true);

    try {
      if (id) {
        const payload: UpdateProductRequest = { ...form };
        await productService.updateProduct(id, payload);
        toast.success('Product updated successfully.');
      } else {
        const payload: CreateProductRequest = {
          ...form,
          description: form.description || undefined,
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
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5">{id ? 'Edit product' : 'Create product'}</Typography>
              <Typography color="text.secondary">
                Keep inventory records precise and search-ready.
              </Typography>
            </Stack>
            <Button variant="outlined" onClick={() => navigate('/products')}>
              Back to products
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Typography color="text.secondary">Loading product...</Typography>
          ) : (
            <Stack component="form" spacing={3} onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Product name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="SKU"
                    value={form.sku}
                    onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={5}
                    label="Description"
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    inputProps={{ min: 0 }}
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                    }
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/products')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? 'Saving...' : id ? 'Update product' : 'Create product'}
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
