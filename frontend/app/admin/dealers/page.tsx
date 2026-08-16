'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Pagination, ConfirmDialog, Input, Select, Modal } from '@/components/ui';
import type { DealerProfile, PaginatedResponse, Category } from '@/types';

interface DealerFormData {
  shopName: string;
  shopDescription: string;
  shopCategory: string;
  address: string;
  logoUrl: string;
  isApproved: boolean;
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

const emptyForm: DealerFormData = {
  shopName: '', shopDescription: '', shopCategory: '', address: '', logoUrl: '',
  isApproved: false, email: '', password: '', fullName: '', phone: ''
};

function DealersContent() {
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DealerFormData>(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDealers = useCallback(async () => {
    try {
      const response = await adminApi.getDealers({ search, category: categoryFilter, page: currentPage, pageSize: 10 });
      const data = response.data as PaginatedResponse<DealerProfile>;
      setDealers(data.items);
      setTotalPages(Math.max(1, Math.ceil(data.total / 10)));
    } catch {
      // error handled silently
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, currentPage]);

  useEffect(() => { fetchDealers(); }, [fetchDealers]);

  useEffect(() => {
    adminApi.getCategories().then(res => {
      setCategories((res.data as { items: Category[] }).items);
    }).catch(() => {});
  }, []);

  const handleSearch = () => { setCurrentPage(1); fetchDealers(); };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteDealer(deleteId);
      setDealers(prev => prev.filter(d => d.id !== deleteId));
      setDeleteId(null);
    } catch {
      // error handled silently
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (dealer: DealerProfile) => {
    setEditId(dealer.id);
    setFormData({
      shopName: dealer.shopName,
      shopDescription: dealer.shopDescription || '',
      shopCategory: dealer.shopCategory,
      address: dealer.address,
      logoUrl: dealer.logoUrl || '',
      isApproved: dealer.isApproved,
      email: '',
      password: '',
      fullName: '',
      phone: ''
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.shopName || !formData.shopCategory || !formData.address) {
      setFormError('Shop name, category, and address are required');
      return;
    }
    if (!editId && (!formData.email || !formData.password || !formData.fullName)) {
      setFormError('Email, password, and full name are required for new dealers');
      return;
    }
    setIsSaving(true);
    setFormError('');
    try {
      if (editId) {
        await adminApi.updateDealer(editId, { ...formData, password: formData.password || 'placeholder' });
      } else {
        await adminApi.createDealer(formData);
      }
      setShowForm(false);
      fetchDealers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to save dealer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveDealer(id);
      setDealers(prev => prev.map(d => d.id === id ? { ...d, isApproved: true } : d));
    } catch {
      // error handled silently
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Dealers</h2>
        <Button onClick={openAddForm}>+ Add Dealer</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input label="Search" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="w-48">
          <Select
            label="Category"
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map(c => ({ value: c.name, label: c.name }))
            ]}
          />
        </div>
        <Button variant="secondary" onClick={handleSearch}>Search</Button>
      </div>

      {dealers.length === 0 ? (
        <EmptyState icon="🏪" title="No dealers found" />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Shop Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {dealers.map(dealer => (
                  <tr key={dealer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{dealer.shopName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{dealer.userFullName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{dealer.userEmail || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{dealer.shopCategory}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dealer.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {dealer.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{new Date(dealer.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      {!dealer.isApproved && (
                        <button onClick={() => handleApprove(dealer.id)} className="text-green-600 hover:text-green-700">Approve</button>
                      )}
                      <button onClick={() => openEditForm(dealer)} className="text-primary-600 hover:text-primary-700">Edit</button>
                      <button onClick={() => setDeleteId(dealer.id)} className="text-red-600 hover:text-red-700">Delete</button>
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Dealer"
        description="This will permanently delete the dealer and their user account. This action cannot be undone."
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Dealer' : 'Add New Dealer'}>
        <div className="space-y-4">
          {formError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{formError}</div>}
          {!editId && (
            <>
              <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
              <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </>
          )}
          <Input label="Shop Name" value={formData.shopName} onChange={e => setFormData({ ...formData, shopName: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Shop Category *</label>
            <select
              value={formData.shopCategory}
              onChange={e => setFormData({ ...formData, shopCategory: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
          <Input label="Logo URL" value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isApproved" checked={formData.isApproved} onChange={e => setFormData({ ...formData, isApproved: e.target.checked })} className="rounded" />
            <label htmlFor="isApproved" className="text-sm text-neutral-700">Approved (visible to public)</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={isSaving}>{editId ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DealersPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Dealers">
        <DealersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
