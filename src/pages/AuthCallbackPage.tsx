import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { apiClient } from '@/utils/apiClient';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

/**
 * OAuth Callback Handler
 * Processes authentication tokens from GitHub and Google OAuth redirects.
 * Parses token from query params, validates it, and logs the user in.
 */
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
        const missingTokenMessage = 'Missing authentication tokens.';
        toast.error(missingTokenMessage);
        setErrorMessage(missingTokenMessage);
        setLoading(false);
        return;
      }

      try {
        // refreshToken is already set as an HTTP-only cookie by the backend redirect
        apiClient.setAccessToken(accessToken);
        const profileResponse = await authService.getProfile();
        const user = profileResponse.data;

        if (!user) {
          throw new Error('Profile not found');
        }

        dispatch(login({ accessToken, user }));
        toast.success('Logged in successfully.');
        navigate('/');
      } catch (fetchError) {
        toast.error('Unable to complete social login.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [dispatch, location.search, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40 text-center">
        {loading ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
              Social login
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Completing sign in…</h1>
            <p className="mt-2 text-sm text-slate-500">
              Please wait while we finish signing you in.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
              Social login
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Unable to complete login</h1>
            <p className="mt-2 text-sm text-slate-500">
              {errorMessage || 'Please try again or sign in with your email and password.'}
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Backward compatibility export
export const AuthCallbackPage = AuthCallbackHandler;
