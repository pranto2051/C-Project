'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, Input , LoadingProgress} from '@/components/ui';
import type { User } from '@/types';
import toast from 'react-hot-toast';

function ProfileContent() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.me();
        setUser(response.data);
        setFormData({
          fullName: response.data.fullName,
          email: response.data.email,
          phone: response.data.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await authApi.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        newPassword: formData.newPassword || undefined,
        currentPassword: formData.newPassword ? formData.currentPassword : undefined,
      });

      // Refresh user data in auth context
      await refreshUser();

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  


  return (


    <>


      <LoadingProgress isLoading={isLoading} />


      {isLoading ? (


        <div className="flex justify-center py-12">


          <Spinner size="lg" />


        </div>


      ) : (


        <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-200">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">{user?.fullName}</h2>
            <p className="text-sm text-neutral-500">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                error={errors.fullName}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                required
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Change Password</h3>
            <p className="text-sm text-neutral-500 mb-4">Leave blank to keep current password</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Password"
                type="password"
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                error={errors.currentPassword}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                error={errors.newPassword}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  


      )}


    </>


  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Dealer', 'Customer']}>
      <DashboardLayout allowedRoles={['Admin', 'Dealer', 'Customer']} title="My Profile">
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
