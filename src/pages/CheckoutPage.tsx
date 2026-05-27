import { FormEvent, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { CheckoutDraft } from '@/types';
import { orderService } from '@/services/orderService';
import { formatCurrency } from '@/utils/validation';
import { commerceService } from '@/services/commerceService';

export const CheckoutPage = () => {
  const { user } = useAuth();
  const items = useAppSelector((state) => state.cart.items);
  const navigate = useNavigate();
  const savedDraft = orderService.getCheckoutDraft();
  const [form, setForm] = useState<CheckoutDraft>({
    email: savedDraft?.email || user?.email || '',
    phoneNumber: savedDraft?.phoneNumber || user?.phoneNumber || '',
    addressLine1: savedDraft?.addressLine1 || user?.addressLine1 || '',
    addressLine2: savedDraft?.addressLine2 || user?.addressLine2 || '',
    city: savedDraft?.city || user?.city || '',
    state: savedDraft?.state || user?.state || '',
    postalCode: savedDraft?.postalCode || user?.postalCode || '',
    country: savedDraft?.country || user?.country || '',
    deliveryInstructions: savedDraft?.deliveryInstructions || '',
    paymentMethod: savedDraft?.paymentMethod || 'dummy-card',
  });

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.phoneNumber || !form.addressLine1 || !form.city || !form.state || !form.postalCode || !form.country) {
      toast.error('Complete your delivery details before continuing.');
      return;
    }

    try {
      const holdResponse = await commerceService.acquireCheckoutHold(items);
      if (!holdResponse.data) {
        throw new Error(holdResponse.message || 'Unable to reserve items for checkout.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reserve items for checkout.');
      navigate('/cart');
      return;
    }

    orderService.saveCheckoutDraft(form);
    navigate('/payment');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <Box>
                <Typography variant="h5">Checkout details</Typography>
                <Typography color="text.secondary">
                  Shipping and contact information used for this order.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone number"
                    value={form.phoneNumber}
                    onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address line 1"
                    value={form.addressLine1}
                    onChange={(event) => setForm((current) => ({ ...current, addressLine1: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address line 2"
                    value={form.addressLine2}
                    onChange={(event) => setForm((current) => ({ ...current, addressLine2: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="State"
                    value={form.state}
                    onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Postal code"
                    value={form.postalCode}
                    onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={form.country}
                    onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Delivery instructions"
                    value={form.deliveryInstructions}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, deliveryInstructions: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>

              <FormControl>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Payment method
                </Typography>
                <RadioGroup
                  value={form.paymentMethod}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      paymentMethod: event.target.value as CheckoutDraft['paymentMethod'],
                    }))
                  }
                >
                  <FormControlLabel value="dummy-card" control={<Radio />} label="Dummy card payment" />
                  <FormControlLabel value="cash-on-delivery" control={<Radio />} label="Cash on delivery" />
                </RadioGroup>
              </FormControl>

              <Button type="submit" variant="contained" size="large">
                Continue to payment
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={5}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Order summary</Typography>
              {items.map((item) => (
                <Stack key={item.product.id} direction="row" justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography fontWeight={600}>{item.product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty {item.quantity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {`${item.product.availableQuantity ?? item.product.quantity} available before reservation`}
                    </Typography>
                  </Box>
                  <Typography>{formatCurrency(item.product.price * item.quantity)}</Typography>
                </Stack>
              ))}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatCurrency(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Shipping</Typography>
                <Typography>{subtotal > 250 ? 'Free' : formatCurrency(12)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(subtotal > 250 ? subtotal : subtotal + 12)}</Typography>
              </Stack>
              <Alert severity="info">
                Payment is simulated for this flow. Orders are stored locally for the signed-in customer.
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
