import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, isValidPassword, getErrorMessage } from '@/utils/validation';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M21.35 11.1H12v2.8h5.15c-.23 1.4-.95 2.6-2.03 3.4l3.3 2.6c1.94-1.8 3.05-4.4 3.05-7.6 0-.6-.05-1.1-.15-1.6z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.95-.9 6.6-2.4l-3.3-2.6c-.9.6-2 .9-3.3.9-2.55 0-4.7-1.7-5.47-4.1l-3.35 2.6C3.9 19.9 7.6 22 12 22z"
    />
    <path
      fill="#FBBC05"
      d="M6.53 13.9a6.8 6.8 0 0 1 0-3.8l-3.35-2.6A11.96 11.96 0 0 0 0 12c0 1.9.45 3.7 1.18 5.3l3.35-2.6z"
    />
    <path
      fill="#EA4335"
      d="M12 6.5c1.45 0 2.75.5 3.78 1.48l2.82-2.82C16.95 3.35 14.6 2.5 12 2.5 7.6 2.5 3.9 4.6 1.18 7.7l3.35 2.6C7.28 8.2 9.45 6.5 12 6.5z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.8-.2.8-.5v-2c-3.34.7-4-1.6-4-1.6-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.6 1.1 1.6 1.1 1 .1 1.5 1.3 1.5 1.3.9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.7-.3-5.5-1.4-5.5-6.1 0-1.4.5-2.5 1.2-3.4-.1-.3-.5-1.4.1-2.9 0 0 1-.3 3.4 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.4-1.5 3.4-1.2 3.4-1.2.6 1.5.2 2.6.1 2.9.8.9 1.2 2 1.2 3.4 0 4.7-2.8 5.8-5.5 6.1.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      return toast.error('Enter a valid email address.');
    }

    if (!isValidPassword(password)) {
      return toast.error('Password must be at least 8 characters.');
    }

    setLoading(true);

    try {
      await login({ email, password });
      toast.success('Logged in successfully.');
      navigate('/');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Login to your account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Secure access to inventory, analytics and product management.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="********"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-slate-500">Or continue with</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="/api/v1/users/auth/google"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <span className="mr-3 inline-flex items-center">
                <GoogleIcon />
              </span>
              Google
            </a>
            <a
              href="/api/v1/users/auth/github"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <span className="mr-3 inline-flex items-center text-slate-900">
                <GitHubIcon />
              </span>
              GitHub
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
