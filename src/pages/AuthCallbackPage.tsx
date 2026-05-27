import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { apiClient } from '@/utils/apiClient';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

export const AuthCallbackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('token');
      const error = params.get('error');

      if (error) {
        toast.error(error);
        setErrorMessage(error);
        setLoading(false);
        return;
      }

      if (!accessToken) {
        setErrorMessage('Missing authentication tokens.');
        setLoading(false);
        return;
      }

      try {
        apiClient.setAccessToken(accessToken);
        const profileResponse = await authService.getProfile();
        const user = profileResponse.data;

        if (!user) {
          throw new Error('Profile not found');
        }

        dispatch(login({ accessToken, user }));
        navigate('/');
      } catch (fetchError) {
        toast.error('Unable to complete social login.');
        setErrorMessage('Unable to complete social login.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [dispatch, location.search, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: 'linear-gradient(180deg, #f8fafc 0%, #ecfeff 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="overline" color="primary.main">
              Social login
            </Typography>
            {loading ? (
              <>
                <CircularProgress size={28} />
                <Typography variant="h5">Completing sign in</Typography>
                <Typography color="text.secondary">
                  Please wait while we complete authentication.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h5">Unable to complete login</Typography>
                <Typography color="text.secondary">
                  {errorMessage || 'Please try again or use email and password sign in.'}
                </Typography>
                <Button component={RouterLink} to="/login" variant="contained">
                  Back to login
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export const AuthCallbackPage = AuthCallbackHandler;
