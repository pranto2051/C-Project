'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { authApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Button, Input, Card, CardBody, Spinner } from '@/components/ui';
import toast from 'react-hot-toast';

function AccountContent() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    try {
      await authApi.updateProfile({ fullName, phone });
      await refreshUser();
      setSuccess(true);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsPasswordLoading(true);
    try {
      await authApi.updateProfile({ newPassword });
      toast.success('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 font-heading">My Account</h1>

      {/* Profile Section */}
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md">Profile updated successfully!</div>}
            <Input label="Email" type="email" value={user.email} disabled />
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Role:</span>
              <span className="text-sm font-medium text-neutral-900">{user.role}</span>
            </div>
            <Button type="submit" isLoading={isLoading}>Update Profile</Button>
          </form>
        </CardBody>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-500">Passwords do not match</p>
            )}
            <Button type="submit" isLoading={isPasswordLoading}>Change Password</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer', 'Dealer', 'Admin']}>
      <AccountContent />
    </ProtectedRoute>
  );
}
