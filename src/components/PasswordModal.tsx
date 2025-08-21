import React, { useEffect, useState } from 'react';

type PasswordModalProps = {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  error?: string | null;
};

export default function PasswordModal({ isOpen, onSubmit, error }: PasswordModalProps) {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) setPassword('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enter password</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <button
            type="submit"
            className="w-full inline-flex justify-center items-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 px-4 py-2 font-medium"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
