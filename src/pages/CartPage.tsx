import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeItem, updateQuantity, clearCart } from '@/store/slices/cartSlice';
import { formatCurrency } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';

export const CartPage = () => {
  const { user } = useAuth();
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 250 || items.length === 0 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Stack spacing={2.5}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h5">Your cart</Typography>
                <Typography color="text.secondary">
                  Review line items before moving to checkout and payment.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {items.length === 0 ? (
            <Alert
              severity="info"
              action={
                <Button component={RouterLink} to="/shop/search" color="inherit" size="small">
                  Browse catalog
                </Button>
              }
            >
              Your cart is empty.
            </Alert>
          ) : (
            items.map((item) => (
              <Card key={item.product.id}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <Typography variant="h6">{item.product.name}</Typography>
                      <Typography color="text.secondary">{item.product.sku}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Qty"
                        inputProps={{ min: 1 }}
                        value={item.quantity}
                        onChange={(event) =>
                          dispatch(
                            updateQuantity({
                              productId: item.product.id,
                              quantity: Math.max(1, Number(event.target.value) || 1),
                              userId: user?.id,
                            })
                          )
                        }
                      />
                      <Typography variant="caption" color="text.secondary">
                        {`${item.product.availableQuantity ?? item.product.quantity} available`}
                      </Typography>
                    </Grid>
                    <Grid item xs={8} md={3}>
                      <Typography fontWeight={700}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} md={1}>
                      <IconButton onClick={() => dispatch(removeItem(item.product.id))}>
                        <DeleteRoundedIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Summary</Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatCurrency(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Shipping</Typography>
                <Typography>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(total)}</Typography>
              </Stack>
              <Button variant="contained" size="large" onClick={() => navigate('/checkout')} disabled={items.length === 0}>
                Checkout
              </Button>
              <Button variant="outlined" color="inherit" onClick={() => dispatch(clearCart())} disabled={items.length === 0}>
                Clear cart
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CartPage;
