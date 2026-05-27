import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { formatCurrency, formatDate } from '@/utils/validation';

const pageSizes = [10, 20, 50];

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchProducts(page + 1, limit, search);
      setProducts(response.data ?? []);
      setTotal(response.pagination?.total ?? 0);
    } catch (error) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, limit]);

  const handleSearch = async () => {
    setPage(0);
    try {
      const response = await productService.fetchProducts(1, limit, search);
      setProducts(response.data ?? []);
      setTotal(response.pagination?.total ?? 0);
    } catch (error) {
      toast.error('Failed to load products.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await productService.deleteProduct(deleteTarget.id);
      toast.success('Product deleted successfully.');
      setDeleteTarget(null);
      loadProducts();
    } catch (error) {
      toast.error('Unable to delete product.');
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', lg: 'center' }}
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5">Product administration</Typography>
              <Typography color="text.secondary">
                Manage catalog data, keep stock accurate, and review the latest updates.
              </Typography>
            </Stack>
            <Button
              component={RouterLink}
              to="/products/new"
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              Add product
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search products"
              placeholder="Name or SKU"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Rows"
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(0);
              }}
              sx={{ width: { xs: '100%', lg: 140 } }}
            >
              {pageSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" onClick={handleSearch}>
              Search
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {products.length === 0 && !loading ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No products match your current filters.
            </Alert>
          ) : (
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography fontWeight={600} noWrap>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                        <TableCell align="right">{product.quantity}</TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant="body2" noWrap color="text.secondary">
                            {product.creator
                              ? `${product.creator.firstName} ${product.creator.lastName}`
                              : 'You'}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(product.updatedAt)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              component={RouterLink}
                              to={`/products/${product.id}/edit`}
                              size="small"
                              startIcon={<EditOutlinedIcon />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteOutlineRoundedIcon />}
                              onClick={() => setDeleteTarget(product)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={limit}
            rowsPerPageOptions={pageSizes}
            onRowsPerPageChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `Delete ${deleteTarget.name} permanently? This action cannot be undone.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
