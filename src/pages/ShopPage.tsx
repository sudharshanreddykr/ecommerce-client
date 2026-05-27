import { useEffect, useState } from 'react';
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Product, SearchSuggestion } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { searchService } from '@/services/searchService';
import { formatCurrency } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';
import { commerceService } from '@/services/commerceService';

export const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [query, setQuery] = useState(searchParams.get('query') ?? '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const load = async (nextQuery = query) => {
    setLoading(true);
    try {
      const response = await searchService.searchCatalog(nextQuery);
      setProducts(response.results);
      setRecommendations(response.recommendations);
    } catch (error) {
      toast.error('Unable to load catalog results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialQuery = searchParams.get('query') ?? '';
    setQuery(initialQuery);
    load(initialQuery);
  }, [searchParams, user?.id]);

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
        const nextSuggestions = await searchService.getSuggestions(nextQuery);
        setSuggestions(nextSuggestions);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5">Search the catalog</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                  if (nextValue.trim()) {
                    load(nextValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search products, SKU, or keywords"
                    onKeyDown={(event) => event.key === 'Enter' && load()}
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
                        Suggested from {option.matchType}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              />
              <Button variant="contained" size="large" onClick={() => load()}>
                Search
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Search results and the recommendation rail are exposed through an Elastic-ready client service.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesomeRoundedIcon color="secondary" />
              <Typography variant="h6">Recommended for quick discovery</Typography>
            </Stack>
            <Grid container spacing={2}>
              {recommendations.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={product.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography fontWeight={700}>{product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(product.price)}
                        </Typography>
                        <Chip size="small" label={`${product.quantity} in stock`} />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : products.length > 0 ? (
        <Grid container spacing={2.5}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} lg={4} key={product.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Typography
                        variant="h6"
                        sx={{
                          minWidth: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Chip size="small" color={product.quantity > 0 ? 'success' : 'default'} label={product.quantity > 0 ? 'In stock' : 'Out of stock'} />
                    </Stack>
                    <Typography
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description || 'Curated catalog item with fast discovery support.'}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(product.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        SKU {product.sku}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
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
        <Alert severity="info">No products match your search.</Alert>
      )}
    </Stack>
  );
};

export default ShopPage;
