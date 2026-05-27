import { FormEvent, useEffect, useState } from 'react';
import {
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
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage, isValidEmail, isValidName, isValidPassword } from '@/utils/validation';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    addressLine1: user?.addressLine1 || '',
    addressLine2: user?.addressLine2 || '',
    city: user?.city || '',
    state: user?.state || '',
    postalCode: user?.postalCode || '',
    country: user?.country || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      addressLine1: user?.addressLine1 || '',
      addressLine2: user?.addressLine2 || '',
      city: user?.city || '',
      state: user?.state || '',
      postalCode: user?.postalCode || '',
      country: user?.country || '',
    }));
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!isValidName(form.firstName) || !isValidName(form.lastName)) {
      toast.error('Provide a valid first and last name.');
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error('Provide a valid email address.');
      return;
    }

    if (form.password && !isValidPassword(form.password)) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.updateProfile(user.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        password: form.password || undefined,
      });

      if (response.data) {
        updateProfile(response.data);
        setForm((current) => ({ ...current, password: '' }));
        toast.success('Profile updated successfully.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5}>
            <Typography variant="h5">Profile</Typography>
            <Typography color="text.secondary">
              Maintain contact, shipping, and authentication details for your account.
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="First name" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last name" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone number" value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} />
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
              <TextField fullWidth label="Country" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="New password"
                placeholder="Leave blank to keep the current password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Saving...' : 'Save profile'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
