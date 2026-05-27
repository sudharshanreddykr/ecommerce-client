import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { formatCurrency } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';
import { commerceService } from '@/services/commerceService';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    productService
      .fetchProductById(id)
      .then((response) => setProduct(response.data ?? null))
      .catch(() => toast.error('Unable to load product details.'))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return <Alert severity="warning">Product not found.</Alert>;
  }

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Chip label={`SKU ${product.sku}`} sx={{ width: 'fit-content' }} />
              <Chip
                label={
                  product.isOutOfStock
                    ? 'Out of stock'
                    : `${product.availableQuantity ?? product.quantity} available`
                }
                color={product.isOutOfStock ? 'default' : 'success'}
                sx={{ width: 'fit-content' }}
              />
              <Typography variant="h4">{product.name}</Typography>
              <Typography color="text.secondary">
                {product.description || 'This product is available in the catalog and ready for checkout.'}
              </Typography>
              <Typography variant="h5" color="primary.main">
                {formatCurrency(product.price)}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  if ((product.availableQuantity ?? product.quantity) <= 0) {
                    toast.error(`${product.name} is out of stock.`);
                    return;
                  }
                  commerceService.recordCartEvent(product, 1).catch(() => undefined);
                  dispatch(addItem({ product, userId: user?.id }));
                  toast.success(`${product.name} added to cart.`);
                }}
                disabled={product.isOutOfStock}
              >
                Add to cart
              </Button>
              <Button variant="outlined" onClick={() => navigate('/cart')}>
                Go to cart
              </Button>
              <Button onClick={() => navigate('/shop/search')}>Back to search</Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProductDetailPage;
