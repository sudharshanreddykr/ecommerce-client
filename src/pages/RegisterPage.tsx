import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { getErrorMessage, isValidEmail, isValidName, isValidPassword } from '@/utils/validation';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidName(form.firstName) || !isValidName(form.lastName)) {
      toast.error('Please enter a valid first and last name.');
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(form.password)) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(form);
      if (response.data) {
        toast.success('Account created. Please sign in.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background:
          'radial-gradient(circle at top right, rgba(249,115,22,0.14), transparent 18%), linear-gradient(135deg, #f8fafc 0%, #ecfeff 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 560 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="overline" color="primary.main">
                Create account
              </Typography>
              <Typography variant="h4">Start your account</Typography>
              <Typography color="text.secondary">
                Register once and keep your contact and shipping details ready for checkout.
              </Typography>
            </Stack>

            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="First name" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Last name" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Phone number" value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Country" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address line 1" value={form.addressLine1} onChange={(event) => setForm((current) => ({ ...current, addressLine1: event.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address line 2" value={form.addressLine2} onChange={(event) => setForm((current) => ({ ...current, addressLine2: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Postal code" value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </Stack>

            <Typography color="text.secondary">
              Already registered? <Link to="/login">Sign in</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
