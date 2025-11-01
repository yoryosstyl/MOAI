'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password.');
      setLoading(false);
      return;
    }

    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, formData.newPassword);

      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Error changing password:', err);

      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('For security reasons, please log out and log back in before changing your password.');
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user signed in with Google (can't change password)
  const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (isGoogleUser) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Cannot Change Password
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  You signed in with Google. To change your password, please visit your Google account settings.
                </p>
                <div className="mt-6">
                  <Link
                    href="/profile"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Back to Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Change your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your current password and choose a new one
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      Password changed successfully!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Redirecting to your profile...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <Link
                  href="/profile"
                  className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
