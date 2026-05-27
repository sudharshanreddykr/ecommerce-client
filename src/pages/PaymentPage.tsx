import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/validation';
import { commerceService } from '@/services/commerceService';

export const PaymentPage = () => {
  const { user } = useAuth();
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const draft = orderService.getCheckoutDraft();
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardName, setCardName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);
  const [countdownMs, setCountdownMs] = useState(0);
  const total = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return subtotal > 250 ? subtotal : subtotal + 12;
  }, [items]);

  if (!draft || items.length === 0 || !user) {
    return <Navigate to="/checkout" replace />;
  }

  useEffect(() => {
    let interval: number | null = null;

    const syncHold = async () => {
      const response = await commerceService.getMyHold();
      const hold = response.data;
      if (!hold) {
        orderService.clearCheckoutDraft();
        toast.error('Checkout timed out. Reserved stock has been released.');
        navigate('/cart', { replace: true });
        return;
      }

      const tick = () => {
        const remaining = Math.max(new Date(hold.expiresAt).getTime() - Date.now(), 0);
        setCountdownMs(remaining);
        if (remaining <= 0) {
          orderService.clearCheckoutDraft();
          toast.error('Checkout timed out. Reserved stock has been released.');
          navigate('/cart', { replace: true });
        }
      };

      tick();
      interval = window.setInterval(tick, 1000);
    };

    syncHold().catch(() => {
      toast.error('Unable to validate checkout reservation.');
      navigate('/cart', { replace: true });
    });

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [navigate, user.id]);

  const handlePay = async () => {
    if (draft.paymentMethod === 'dummy-card' && (!cardNumber || !cardName || !cvv)) {
      toast.error('Enter the dummy card details to continue.');
      return;
    }

    setProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    try {
      await orderService.createOrder(draft, items);
    } catch (error) {
      setProcessing(false);
      toast.error(error instanceof Error ? error.message : 'Unable to create order.');
      navigate('/cart');
      return;
    }
    dispatch(clearCart());
    orderService.clearCheckoutDraft();
    toast.success('Payment accepted and order placed.');
    navigate('/orders');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CreditCardRoundedIcon color="primary" />
                <BoxText
                  title="Dummy payment gateway"
                  subtitle={`Complete payment in ${Math.ceil(countdownMs / 1000)}s or the reserved stock is released.`}
                />
              </Stack>

              {draft.paymentMethod === 'dummy-card' ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Card number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField fullWidth label="Name on card" value={cardName} onChange={(event) => setCardName(event.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="CVV" value={cvv} onChange={(event) => setCvv(event.target.value)} />
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  Cash on delivery selected. Place the order to confirm shipping details.
                </Alert>
              )}

              <Button variant="contained" size="large" onClick={handlePay} disabled={processing}>
                {processing ? 'Processing payment...' : `Pay ${formatCurrency(total)}`}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={5}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Review</Typography>
              <Typography color="text.secondary">
                {draft.addressLine1}, {draft.city}, {draft.state}, {draft.country}
              </Typography>
              <Divider />
              {items.map((item) => (
                <Stack key={item.product.id} direction="row" justifyContent="space-between">
                  <Typography>{item.product.name} x {item.quantity}</Typography>
                  <Typography>{formatCurrency(item.product.price * item.quantity)}</Typography>
                </Stack>
              ))}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(total)}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const BoxText = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Stack spacing={0.5}>
    <Typography variant="h6">{title}</Typography>
    <Typography color="text.secondary">{subtitle}</Typography>
  </Stack>
);
