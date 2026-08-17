'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Pagination, ConfirmDialog, Input , LoadingProgress} from '@/components/ui';
import type { User, PaginatedResponse } from '@/types';

function CustomersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusId, setStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async (page: number, searchQuery?: string) => {
    try {
      const response = await adminApi.getUsers({ role: 'Customer', search: searchQuery, page, pageSize: 10 });
      const data = response.data as PaginatedResponse<User>;
      setUsers(data.items);
      setTotal(data.total);
      setTotalPages(Math.max(1, Math.ceil(data.total / 10)));
    } catch {
      // error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, search);
  };

  const handleStatusChange = async () => {
    if (!statusId) return;
    setIsUpdating(true);
    try {
      await adminApi.updateUserStatus(statusId, { isActive: newStatus });
      setUsers((prev) => prev.map((u) => u.id === statusId ? { ...u, isActive: newStatus } : u));
      setStatusId(null);
    } catch {
      // error handled silently
    } finally {
      setIsUpdating(false);
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


        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Customers</h2>
          <p className="text-sm text-neutral-500 mt-1">{total} customer{total !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button variant="secondary" onClick={handleSearch}>Search</Button>
      </div>

      {users.length === 0 ? (
        <EmptyState icon="👥" title="No customers found" description="No customers have registered yet." />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => { setStatusId(user.id); setNewStatus(!user.isActive


      )}


    </>


  );
}}
                        className={`font-medium ${user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-neutral-200">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!statusId}
        onClose={() => setStatusId(null)}
        onConfirm={handleStatusChange}
        title={newStatus ? 'Activate Customer' : 'Deactivate Customer'}
        description={`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this customer?`}
        variant={newStatus ? 'primary' : 'danger'}
        isLoading={isUpdating}
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Customers">
        <CustomersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
