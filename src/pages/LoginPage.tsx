import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage, isValidEmail, isValidPassword } from '@/utils/validation';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      toast.error('Enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
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
          'radial-gradient(circle at top left, rgba(94,234,212,0.16), transparent 20%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="overline" color="primary.main">
                Welcome back
              </Typography>
              <Typography variant="h4">Sign in</Typography>
              <Typography color="text.secondary">
                Access the admin workspace or customer storefront with the same account system.
              </Typography>
            </Stack>

            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>

            <Divider>or</Divider>

            <Stack spacing={1.5}>
              <Button variant="outlined" href="/api/v1/users/auth/google">
                Continue with Google
              </Button>
              <Button variant="outlined" href="/api/v1/users/auth/github">
                Continue with GitHub
              </Button>
            </Stack>

            <Typography color="text.secondary">
              New here? <Link to="/register">Create an account</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
