import { ReactNode, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import { productService } from '@/services/productService';
import { userService } from '@/services/userService';
import { orderService } from '@/services/orderService';
import { commerceService } from '@/services/commerceService';
import { CartEvent, CheckoutHold, Order, Product, User } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/validation';

type DashboardState = {
  products: Product[];
  lowStock: Product[];
  users: User[];
  orders: Order[];
  cartEvents: CartEvent[];
  checkoutHolds: CheckoutHold[];
};

type PeriodFilter = '7d' | '30d' | '90d' | 'all';
type RankingMetric = 'revenue' | 'units';

const priceBands = [
  { label: 'Under $50', match: (price: number) => price < 50 },
  { label: '$50 - $199', match: (price: number) => price >= 50 && price < 200 },
  { label: '$200 - $499', match: (price: number) => price >= 200 && price < 500 },
  { label: '$500+', match: (price: number) => price >= 500 },
];

const stockBands = [
  { label: 'Out of stock', match: (quantity: number) => quantity === 0, color: '#dc2626' },
  { label: 'Critical', match: (quantity: number) => quantity > 0 && quantity <= 5, color: '#f59e0b' },
  { label: 'Healthy', match: (quantity: number) => quantity > 5 && quantity <= 25, color: '#059669' },
  { label: 'Deep stock', match: (quantity: number) => quantity > 25, color: '#2563eb' },
];

const getCutoff = (period: PeriodFilter) => {
  if (period === 'all') {
    return 0;
  }

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  return Date.now() - days * 24 * 60 * 60 * 1000;
};

export const DashboardPage = () => {
  const [state, setState] = useState<DashboardState>({
    products: [],
    lowStock: [],
    users: [],
    orders: [],
    cartEvents: [],
    checkoutHolds: [],
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>('revenue');
  const [focusUserId, setFocusUserId] = useState<string>('all');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [productsResponse, lowStockResponse, usersResponse] = await Promise.all([
          productService.fetchProducts(1, 100),
          productService.fetchLowStock(10),
          userService.fetchUsers(1, 100),
        ]);
        const [ordersResponse, cartEventsResponse, holdsResponse] = await Promise.all([
          orderService.fetchAllOrders(),
          commerceService.fetchAllCartEvents(),
          commerceService.fetchAllHolds(),
        ]);

        setState({
          products: productsResponse.data ?? [],
          lowStock: lowStockResponse.data ?? [],
          users: usersResponse.data ?? [],
          orders: ordersResponse.data ?? [],
          cartEvents: cartEventsResponse.data ?? [],
          checkoutHolds: holdsResponse.data ?? [],
        });
      } catch (error) {
        toast.error('Unable to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const analytics = useMemo(() => {
    const { products, users, orders, cartEvents, checkoutHolds } = state;
    const effectiveProducts: Product[] = products;
    const inventoryValue = effectiveProducts.reduce(
      (sum, product) => sum + product.price * (product.availableQuantity ?? product.quantity),
      0
    );
    const totalUnits = effectiveProducts.reduce(
      (sum, product) => sum + (product.availableQuantity ?? product.quantity),
      0
    );
    const outOfStock = effectiveProducts.filter((product) => product.isOutOfStock);
    const averageCatalogPrice = products.length
      ? effectiveProducts.reduce((sum, product) => sum + product.price, 0) / effectiveProducts.length
      : 0;
    const recentProducts = [...effectiveProducts]
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
      .slice(0, 6);
    const cutoff = getCutoff(period);

    const filteredOrders = orders.filter((order) => {
      const inPeriod = cutoff === 0 || new Date(order.placedAt).getTime() >= cutoff;
      const byUser = focusUserId === 'all' || order.userId === focusUserId;
      return inPeriod && byUser;
    });

    const stockDistribution = stockBands.map((band) => ({
      ...band,
      count: effectiveProducts.filter((product) =>
        band.match(product.availableQuantity ?? product.quantity)
      ).length,
    }));

    const pricingDistribution = priceBands.map((band) => ({
      label: band.label,
      count: effectiveProducts.filter((product) => band.match(product.price)).length,
    }));

    const ownerDistribution = (Object.values(
      effectiveProducts.reduce<Record<string, { label: string; count: number; value: number }>>((acc, product) => {
        const key = product.creator?.id ?? 'self';
        const label = product.creator
          ? `${product.creator.firstName} ${product.creator.lastName}`
          : 'Current user';

        if (!acc[key]) {
          acc[key] = { label, count: 0, value: 0 };
        }

        acc[key].count += 1;
        acc[key].value += product.price * (product.availableQuantity ?? product.quantity);
        return acc;
      }, {})
    ) as Array<{ label: string; count: number; value: number }>)
      .sort((left, right) => right.value - left.value)
      .slice(0, 5);

    const ordersByDayMap = filteredOrders.reduce<Record<string, { label: string; revenue: number; orders: number }>>(
      (acc, order) => {
        const key = new Date(order.placedAt).toISOString().slice(0, 10);
        if (!acc[key]) {
          acc[key] = { label: formatDate(order.placedAt), revenue: 0, orders: 0 };
        }
        acc[key].revenue += order.total;
        acc[key].orders += 1;
        return acc;
      },
      {}
    );

    const ordersTimeline = Object.entries(ordersByDayMap)
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-8)
      .map(([, value]) => value);

    const productSales = (Object.values(
      filteredOrders.reduce<
        Record<string, { productId: string; name: string; revenue: number; units: number; orders: number }>
      >((acc, order) => {
        order.items.forEach((item) => {
          if (!acc[item.productId]) {
            acc[item.productId] = {
              productId: item.productId,
              name: item.name,
              revenue: 0,
              units: 0,
              orders: 0,
            };
          }

          acc[item.productId].revenue += item.price * item.quantity;
          acc[item.productId].units += item.quantity;
          acc[item.productId].orders += 1;
        });

        return acc;
      }, {})
    ) as Array<{ productId: string; name: string; revenue: number; units: number; orders: number }>)
      .sort((left, right) =>
        rankingMetric === 'revenue' ? right.revenue - left.revenue : right.units - left.units
      )
      .slice(0, 6);

    const userPurchases = (Object.values(
      filteredOrders.reduce<
        Record<
          string,
          {
            userId: string;
            label: string;
            orders: number;
            spend: number;
            units: number;
          }
        >
      >((acc, order) => {
        const user = users.find((candidate) => candidate.id === order.userId);
        const label = user
          ? `${user.firstName} ${user.lastName}`
          : order.shippingAddress.email;

        if (!acc[order.userId]) {
          acc[order.userId] = {
            userId: order.userId,
            label,
            orders: 0,
            spend: 0,
            units: 0,
          };
        }

        acc[order.userId].orders += 1;
        acc[order.userId].spend += order.total;
        acc[order.userId].units += order.itemCount;
        return acc;
      }, {})
    ) as Array<{ userId: string; label: string; orders: number; spend: number; units: number }>)
      .sort((left, right) => right.spend - left.spend)
      .slice(0, 6);

    const orderStatus = ['paid', 'processing', 'shipped'].map((status) => ({
      label: status,
      count: filteredOrders.filter((order) => order.status === status).length,
    }));

    const paidOrders = filteredOrders.filter((order) => order.status === 'paid');
    const conversionRate = filteredOrders.length
      ? Math.round((paidOrders.length / filteredOrders.length) * 100)
      : 0;

    const filteredCartEvents = cartEvents.filter((event) => {
      const inPeriod = cutoff === 0 || new Date(event.createdAt).getTime() >= cutoff;
      const byUser = focusUserId === 'all' || event.userId === focusUserId;
      return inPeriod && byUser;
    });

    const cartedProducts = Object.values(
      filteredCartEvents.reduce<
        Record<string, { productId: string; label: string; adds: number; quantity: number }>
      >((acc, event) => {
        if (!acc[event.productId]) {
          acc[event.productId] = {
            productId: event.productId,
            label: event.productName,
            adds: 0,
            quantity: 0,
          };
        }
        acc[event.productId].adds += 1;
        acc[event.productId].quantity += event.quantity;
        return acc;
      }, {})
    )
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 6);

    return {
      inventoryValue,
      totalUnits,
      averageCatalogPrice,
      outOfStock,
      recentProducts,
      stockDistribution,
      pricingDistribution,
      ownerDistribution,
      productSales,
      userPurchases,
      ordersTimeline,
      orderStatus,
      filteredOrders,
      filteredCartEvents,
      cartedProducts,
      activeHolds: checkoutHolds,
      lowStockProducts: effectiveProducts
        .filter((product) => (product.availableQuantity ?? product.quantity) <= 10)
        .sort(
          (left, right) =>
            (left.availableQuantity ?? left.quantity) - (right.availableQuantity ?? right.quantity)
        ),
      totalProducts: effectiveProducts.length,
      lowStockCount: effectiveProducts.filter(
        (product) => (product.availableQuantity ?? product.quantity) <= 10
      ).length,
      totalUsers: users.length,
      admins: users.filter((user) => user.role === 'admin').length,
      customers: users.filter((user) => user.role === 'user').length,
      inactiveUsers: users.filter((user) => !user.isActive).length,
      orderRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
      orderUnits: filteredOrders.reduce((sum, order) => sum + order.itemCount, 0),
      averageOrderValue: filteredOrders.length
        ? filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length
        : 0,
      conversionRate,
    };
  }, [focusUserId, period, rankingMetric, state]);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', xl: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', xl: 'center' }}
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5">Operations analytics</Typography>
              <Typography color="text.secondary">
                Interactive catalog, customer, and order intelligence for admin operations.
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={period}
                onChange={(_, value: PeriodFilter | null) => value && setPeriod(value)}
              >
                <ToggleButton value="7d">7D</ToggleButton>
                <ToggleButton value="30d">30D</ToggleButton>
                <ToggleButton value="90d">90D</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
              </ToggleButtonGroup>
              <TextField
                select
                size="small"
                label="Customer focus"
                value={focusUserId}
                onChange={(event) => setFocusUserId(event.target.value)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="all">All customers</MenuItem>
                {state.users
                  .filter((user) => user.role === 'user')
                  .map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6} xl={3}>
          <MetricCard
            title="Catalog value"
            value={formatCurrency(analytics.inventoryValue)}
            subtitle={`${analytics.totalProducts} products in active catalog`}
            icon={<MonetizationOnOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={6} xl={3}>
          <MetricCard
            title="Orders revenue"
            value={formatCurrency(analytics.orderRevenue)}
            subtitle={`${analytics.filteredOrders.length} orders in selected period`}
            icon={<ShoppingBagOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={6} xl={3}>
          <MetricCard
            title="Units sold"
            value={analytics.orderUnits.toLocaleString()}
            subtitle={`Average order ${formatCurrency(analytics.averageOrderValue)}`}
            icon={<ShowChartOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={6} xl={3}>
          <MetricCard
            title="User base"
            value={analytics.totalUsers.toString()}
            subtitle={`${analytics.customers} customers, ${analytics.admins} admins`}
            icon={<PeopleOutlineOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={6} xl={3}>
          <MetricCard
            title="Cart intent"
            value={analytics.filteredCartEvents.length.toString()}
            subtitle="Add-to-cart events in selected period"
            icon={<ShoppingCartOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={6} xl={3}>
          <MetricCard
            title="Active holds"
            value={analytics.activeHolds.length.toString()}
            subtitle="Checkout reservations currently locking stock"
            icon={<LockClockOutlinedIcon color="warning" />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} xl={7}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Inventory health</Typography>
                {analytics.stockDistribution.map((item) => {
                  const percent = analytics.totalProducts
                    ? (item.count / analytics.totalProducts) * 100
                    : 0;

                  return (
                    <Stack key={item.label} spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{item.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count} products
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                          height: 9,
                          borderRadius: 2,
                          '& .MuiLinearProgress-bar': { backgroundColor: item.color },
                        }}
                      />
                    </Stack>
                  );
                })}

                <Box
                  sx={{
                    mt: 1,
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                  }}
                >
                  <MiniStat label="Average catalog price" value={formatCurrency(analytics.averageCatalogPrice)} />
                  <MiniStat label="Low stock products" value={analytics.lowStockCount.toString()} />
                  <MiniStat label="Inactive users" value={analytics.inactiveUsers.toString()} />
                  <MiniStat label="Paid order ratio" value={`${analytics.conversionRate}%`} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} xl={5}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Order status mix</Typography>
                <HorizontalBarChart
                  data={analytics.orderStatus.map((item) => ({
                    label: item.label,
                    value: item.count,
                  }))}
                  color="#0f766e"
                  valueFormatter={(value) => `${value} orders`}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  spacing={1.5}
                >
                  <Typography variant="h6">Top selling products</Typography>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={rankingMetric}
                    onChange={(_, value: RankingMetric | null) => value && setRankingMetric(value)}
                  >
                    <ToggleButton value="revenue">Revenue</ToggleButton>
                    <ToggleButton value="units">Units</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
                {analytics.productSales.length === 0 ? (
                  <Alert severity="info">No order data available for the selected filters.</Alert>
                ) : (
                  <HorizontalBarChart
                    data={analytics.productSales.map((item) => ({
                      label: item.name,
                      value: rankingMetric === 'revenue' ? item.revenue : item.units,
                      secondary:
                        rankingMetric === 'revenue'
                          ? `${item.units} units`
                          : formatCurrency(item.revenue),
                    }))}
                    color="#f97316"
                    valueFormatter={(value) =>
                      rankingMetric === 'revenue' ? formatCurrency(value) : `${value} units`
                    }
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">User purchases</Typography>
                {analytics.userPurchases.length === 0 ? (
                  <Alert severity="info">Customer purchase history will appear after checkout activity.</Alert>
                ) : (
                  <HorizontalBarChart
                    data={analytics.userPurchases.map((item) => ({
                      label: item.label,
                      value: item.spend,
                      secondary: `${item.orders} orders · ${item.units} units`,
                    }))}
                    color="#2563eb"
                    valueFormatter={(value) => formatCurrency(value)}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Most carted products</Typography>
                {analytics.cartedProducts.length === 0 ? (
                  <Alert severity="info">No add-to-cart activity yet for the selected period.</Alert>
                ) : (
                  <HorizontalBarChart
                    data={analytics.cartedProducts.map((item) => ({
                      label: item.label,
                      value: item.quantity,
                      secondary: `${item.adds} add events`,
                    }))}
                    color="#db2777"
                    valueFormatter={(value) => `${value} units`}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Active checkout holds</Typography>
                {analytics.activeHolds.length === 0 ? (
                  <Alert severity="success">No products are locked in checkout right now.</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small" sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell align="right">Expires</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.activeHolds.slice(0, 6).map((hold) => {
                          const owner = state.users.find((user) => user.id === hold.userId);
                          return (
                            <TableRow key={hold.id} hover>
                              <TableCell>
                                <Typography variant="body2" noWrap>
                                  {owner ? `${owner.firstName} ${owner.lastName}` : hold.userId}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 200 }}>
                                <Typography variant="body2" noWrap color="text.secondary">
                                  {hold.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{formatDateTime(hold.expiresAt)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Orders trend</Typography>
                {analytics.ordersTimeline.length === 0 ? (
                  <Alert severity="info">Orders trend appears once customers place orders.</Alert>
                ) : (
                  <TimelineBars data={analytics.ordersTimeline} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Price band distribution</Typography>
                <HorizontalBarChart
                  data={analytics.pricingDistribution.map((item) => ({
                    label: item.label,
                    value: item.count,
                  }))}
                  color="#7c3aed"
                  valueFormatter={(value) => `${value} items`}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Low-stock attention list</Typography>
                {analytics.lowStockProducts.length === 0 ? (
                  <Alert severity="success">No low-stock products at the moment.</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small" sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>SKU</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Value</TableCell>
                          <TableCell align="right">Updated</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.lowStockProducts.slice(0, 8).map((product) => (
                          <TableRow key={product.id} hover>
                            <TableCell sx={{ maxWidth: 240 }}>
                              <Typography variant="body2" noWrap>
                                {product.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell align="right">
                              {product.availableQuantity ?? product.quantity}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(
                                product.price * (product.availableQuantity ?? product.quantity)
                              )}
                            </TableCell>
                            <TableCell align="right">{formatDate(product.updatedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Top inventory owners</Typography>
                <HorizontalBarChart
                  data={analytics.ownerDistribution.map((owner) => ({
                    label: owner.label,
                    value: owner.value,
                    secondary: `${owner.count} products`,
                  }))}
                  color="#0f766e"
                  valueFormatter={(value) => formatCurrency(value)}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Recent operational activity</Typography>
            {analytics.recentProducts.length === 0 && analytics.filteredOrders.length === 0 ? (
              <Alert severity="info">No catalog or order activity is available yet.</Alert>
            ) : (
              <TableContainer>
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Summary</TableCell>
                      <TableCell align="right">When</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ...analytics.recentProducts.map((product) => ({
                        type: 'Product',
                        reference: product.sku,
                        summary: `${product.name} · ${formatCurrency(product.price)} · ${product.quantity} in stock`,
                        when: product.updatedAt,
                      })),
                      ...analytics.filteredOrders.slice(0, 6).map((order) => ({
                        type: 'Order',
                        reference: order.id,
                        summary: `${order.itemCount} units · ${formatCurrency(order.total)} · ${order.shippingAddress.email}`,
                        when: order.placedAt,
                      })),
                    ]
                      .sort(
                        (left, right) =>
                          new Date(right.when).getTime() - new Date(left.when).getTime()
                      )
                      .slice(0, 8)
                      .map((entry) => (
                        <TableRow key={`${entry.type}-${entry.reference}`} hover>
                          <TableCell>
                            <Chip size="small" label={entry.type} variant="outlined" />
                          </TableCell>
                          <TableCell>{entry.reference}</TableCell>
                          <TableCell sx={{ maxWidth: 360 }}>
                            <Typography variant="body2" noWrap color="text.secondary">
                              {entry.summary}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{formatDateTime(entry.when)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}) => (
  <Card>
    <CardContent>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon}
        </Stack>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ border: '1px solid rgba(203,213,225,0.8)', p: 2, borderRadius: 2 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" sx={{ mt: 0.75 }}>
      {value}
    </Typography>
  </Box>
);

const HorizontalBarChart = ({
  data,
  color,
  valueFormatter,
}: {
  data: Array<{ label: string; value: number; secondary?: string }>;
  color: string;
  valueFormatter: (value: number) => string;
}) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Stack spacing={1.5}>
      {data.map((item) => (
        <Stack key={item.label} spacing={0.75}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography
              variant="body2"
              sx={{
                minWidth: 0,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {valueFormatter(item.value)}
            </Typography>
          </Stack>
          <Box sx={{ height: 10, bgcolor: 'rgba(226,232,240,0.9)', borderRadius: 999 }}>
            <Box
              sx={{
                width: `${(item.value / maxValue) * 100}%`,
                height: '100%',
                bgcolor: color,
                borderRadius: 999,
                transition: 'width 220ms ease',
              }}
            />
          </Box>
          {item.secondary ? (
            <Typography variant="caption" color="text.secondary">
              {item.secondary}
            </Typography>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
};

const TimelineBars = ({
  data,
}: {
  data: Array<{ label: string; revenue: number; orders: number }>;
}) => {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
          gap: 1.25,
          alignItems: 'end',
          minHeight: 220,
        }}
      >
        {data.map((item) => (
          <Stack key={item.label} spacing={1} justifyContent="flex-end" alignItems="stretch">
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              {formatCurrency(item.revenue)}
            </Typography>
            <Box
              sx={{
                height: `${Math.max((item.revenue / maxRevenue) * 160, 12)}px`,
                bgcolor: 'primary.main',
                borderRadius: 1.5,
                transition: 'height 220ms ease',
              }}
            />
            <Stack spacing={0.25} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {item.orders} orders
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Box>
    </Stack>
  );
};
