import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import toast from 'react-hot-toast';
import { Product, SearchSuggestion } from '@/types';
import { searchService } from '@/services/searchService';
import { formatCurrency } from '@/utils/validation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import { commerceService } from '@/services/commerceService';

export const CustomerHomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const cartSummary = useMemo(() => {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return { itemCount, subtotal };
  }, [cartItems]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await searchService.searchCatalog('');
        setRecommendations(response.recommendations);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  useEffect(() => {
    const nextQuery = query.trim();
    if (!nextQuery) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        setSuggestions(await searchService.getSuggestions(nextQuery));
      } finally {
        setSuggestionsLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query]);

  const goToSearch = (value = query) => {
    const trimmed = value.trim();
    navigate(trimmed ? `/shop/search?query=${encodeURIComponent(trimmed)}` : '/shop/search');
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(8,145,178,0.92) 48%, rgba(244,114,182,0.82) 100%)',
          color: 'common.white',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(255,255,255,0.24), transparent 28%)',
          }}
        />
        <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative' }}>
          <Stack spacing={2.5} maxWidth={820}>
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label="Customer storefront"
              sx={{ width: 'fit-content', bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }}
            />
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
              Search like a storefront, not a brochure.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.84)', maxWidth: 620 }}>
              Start from a global search bar, jump to results instantly, and move directly into
              cart and checkout from the same page.
            </Typography>

            <Autocomplete
              fullWidth
              freeSolo
              options={suggestions}
              loading={suggestionsLoading}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
              inputValue={query}
              onInputChange={(_, value) => setQuery(value)}
              onChange={(_, value) => {
                const nextValue = typeof value === 'string' ? value : value?.query ?? '';
                setQuery(nextValue);
                goToSearch(nextValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search products across the catalog"
                  onKeyDown={(event) => event.key === 'Enter' && goToSearch()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.96)',
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchRoundedIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {option.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Match from {option.matchType}
                    </Typography>
                  </Stack>
                </Box>
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button onClick={() => goToSearch()} variant="contained" color="secondary">
                Start shopping
              </Button>
              <Button
                component={RouterLink}
                to="/orders"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.36)' }}
              >
                View orders
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TravelExploreRoundedIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Global search
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  Use the storefront search to find products by name, SKU, or description and jump
                  straight into filtered results.
                </Typography>
                <Button variant="outlined" onClick={() => goToSearch()} sx={{ width: 'fit-content' }}>
                  Open full search results
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalMallRoundedIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Fast basket flow
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  Keep basket actions one click away. Review cart volume, subtotal, and move
                  directly to checkout.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`${cartSummary.itemCount} items`} />
                  <Chip label={`Subtotal ${formatCurrency(cartSummary.subtotal)}`} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to="/cart"
                    variant="outlined"
                    startIcon={<VisibilityRoundedIcon />}
                  >
                    View cart
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/checkout"
                    variant="contained"
                    startIcon={<ShoppingCartCheckoutRoundedIcon />}
                    disabled={cartSummary.itemCount === 0}
                  >
                    Go to checkout
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={1.5}
            >
              <Typography variant="h5" fontWeight={700}>
                Recommended now
              </Typography>
              <Button component={RouterLink} to="/shop/search" variant="text">
                Browse full catalog
              </Button>
            </Stack>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : recommendations.length > 0 ? (
              <Grid container spacing={2}>
                {recommendations.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack spacing={1.5}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {product.description || 'Premium catalog item available for immediate purchase.'}
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={700}>
                              {formatCurrency(product.price)}
                            </Typography>
                            <Chip
                              size="small"
                              color={product.isOutOfStock ? 'default' : 'success'}
                              label={
                                product.isOutOfStock
                                  ? 'Out of stock'
                                  : `${product.availableQuantity ?? product.quantity} available`
                              }
                            />
                          </Stack>
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AddShoppingCartRoundedIcon />}
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
                        <Button
                          fullWidth
                          component={RouterLink}
                          to={`/shop/products/${product.id}`}
                          startIcon={<VisibilityRoundedIcon />}
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">No recommendations are available until products exist.</Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
