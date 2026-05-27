import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, isValidName, isValidPassword, getErrorMessage } from '@/utils/validation';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return toast.error('Unable to update profile without a valid user session.');
    }

    if (!isValidName(firstName) || !isValidName(lastName)) {
      return toast.error('Please provide a valid first and last name.');
    }

    if (!isValidEmail(email)) {
      return toast.error('Please provide a valid email address.');
    }

    if (password && !isValidPassword(password)) {
      return toast.error('New password must be at least 8 characters.');
    }

    setLoading(true);

    try {
      const response = await authService.updateProfile(user.id, {
        email,
        firstName,
        lastName,
        password: password || undefined,
      });

      if (response.data) {
        updateProfile(response.data);
        toast.success('Profile updated successfully.');
        setPassword('');
      } else {
        toast.error(response.message || 'Failed to update profile.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Update Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Keep your profile and authentication details current.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">First name</span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Last name</span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email address</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
