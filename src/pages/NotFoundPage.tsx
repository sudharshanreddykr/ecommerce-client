import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg shadow-slate-200/40">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
          Page not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">404</h1>
        <p className="mt-3 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Return home
        </Link>
      </div>
    </div>
  );
};
