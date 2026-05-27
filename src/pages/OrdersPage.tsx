import { useEffect, useState } from 'react';
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/validation';

export const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return null;
  }

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await orderService.fetchMyOrders();
        setOrders(response.data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h5">Order history</Typography>
            <Typography color="text.secondary">
              Every completed checkout is stored for this signed-in customer.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={24} />
              <Typography color="text.secondary">Loading orders...</Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Alert severity="info">No orders yet. Complete checkout from the cart to create one.</Alert>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6">{order.id}</Typography>
                    <Typography color="text.secondary">{formatDateTime(order.placedAt)}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={order.status} color={order.status === 'paid' ? 'success' : 'warning'} />
                    <Typography fontWeight={700}>{formatCurrency(order.total)}</Typography>
                  </Stack>
                </Stack>
                <Divider />
                {order.items.map((item) => (
                  <Stack key={`${order.id}-${item.productId}`} direction="row" justifyContent="space-between">
                    <Typography>
                      {item.name} x {item.quantity}
                    </Typography>
                    <Typography>{formatCurrency(item.price * item.quantity)}</Typography>
                  </Stack>
                ))}
                <Divider />
                <Typography color="text.secondary">
                  Ship to: {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state}, {order.shippingAddress.country}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
};
