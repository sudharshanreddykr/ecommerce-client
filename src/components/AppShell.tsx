import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAppSelector } from '@/store/hooks';

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useAppSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  const navItems =
    user?.role === 'admin'
      ? [
          { label: 'Overview', href: '/dashboard', icon: <DashboardRoundedIcon fontSize="small" /> },
          { label: 'Products', href: '/products', icon: <Inventory2RoundedIcon fontSize="small" /> },
          { label: 'Add Product', href: '/products/new', icon: <AddBusinessRoundedIcon fontSize="small" /> },
          { label: 'Profile', href: '/profile', icon: <PersonRoundedIcon fontSize="small" /> },
        ]
      : [
          { label: 'Shop', href: '/shop', icon: <ShoppingBagRoundedIcon fontSize="small" /> },
          { label: 'Cart', href: '/cart', icon: <ShoppingCartRoundedIcon fontSize="small" /> },
          { label: 'Orders', href: '/orders', icon: <ReceiptLongRoundedIcon fontSize="small" /> },
          { label: 'Profile', href: '/profile', icon: <PersonRoundedIcon fontSize="small" /> },
        ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = navItems.find((item) => location.pathname.startsWith(item.href));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(94,234,212,0.16), transparent 22%), radial-gradient(circle at top right, rgba(249,115,22,0.14), transparent 20%), #f4f6fb',
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(148,163,184,0.16)' }}
      >
        <Toolbar sx={{ minHeight: 80 }}>
          <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setMenuOpen(true)} sx={{ display: { md: 'none' } }}>
              <MenuRoundedIcon />
            </IconButton>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>
                {user?.role === 'admin' ? <Inventory2RoundedIcon /> : <ShoppingBagRoundedIcon />}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Commerce Hub
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role === 'admin' ? 'Operations control center' : 'Customer storefront'}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={NavLink}
                  to={item.href}
                  startIcon={item.icon}
                  color={location.pathname.startsWith(item.href) ? 'primary' : 'inherit'}
                  variant={location.pathname.startsWith(item.href) ? 'contained' : 'text'}
                  sx={{ color: location.pathname.startsWith(item.href) ? 'white' : 'text.primary' }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            {user?.role === 'user' && (
              <IconButton color="primary" onClick={() => navigate('/cart')}>
                <Badge badgeContent={cartCount} color="secondary">
                  <ShoppingCartRoundedIcon />
                </Badge>
              </IconButton>
            )}

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={700}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                </Typography>
              </Box>
              <Button onClick={handleLogout} variant="outlined" startIcon={<LogoutRoundedIcon />}>
                Logout
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4">
                {currentPage?.label || (user?.role === 'admin' ? 'Workspace' : 'Storefront')}
              </Typography>
              <Typography color="text.secondary">
                {user?.role === 'admin'
                  ? 'Manage inventory, monitor stock, and keep catalog data current.'
                  : 'Search products, complete purchases, and track every order from one account.'}
              </Typography>
            </Box>
            <Chip
              label={user?.role === 'admin' ? 'Admin mode' : 'Customer mode'}
              color={user?.role === 'admin' ? 'primary' : 'secondary'}
            />
          </Stack>

          <Outlet />
        </Stack>
      </Container>

      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.href}
                component={NavLink}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                selected={location.pathname.startsWith(item.href)}
                sx={{ borderRadius: 3, mb: 1 }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};
