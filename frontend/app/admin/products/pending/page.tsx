'use client';

import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Modal, ConfirmDialog, LoadingProgress, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import type { Product, DealerProfile, PaginatedResponse } from '@/types';

interface DealerGroup {
  dealerId: string;
  dealerName: string;
  dealerOwnerName: string;
  dealerAddress: string;
  products: Product[];
}

function PendingProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dealersMap, setDealersMap] = useState<Record<string, DealerProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected dealer for viewing pending requests
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);

  // Reject dialog state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchPendingData = async () => {
    setIsLoading(true);
    try {
      // Fetch pending products & dealer profiles in parallel
      const [productsRes, dealersRes] = await Promise.all([
        adminApi.getPendingProducts({ page: 1, pageSize: 1000 }),
        adminApi.getDealers({ page: 1, pageSize: 1000 }),
      ]);

      const productItems = (productsRes.data as PaginatedResponse<Product>).items || [];
      setProducts(productItems);

      const dealerItems = (dealersRes.data as PaginatedResponse<DealerProfile>).items || [];
      const map: Record<string, DealerProfile> = {};
      dealerItems.forEach((d) => {
        map[d.id] = d;
      });
      setDealersMap(map);
    } catch {
      toast.error('Failed to load pending products data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  // Group pending products by dealer
  const dealerGroups = useMemo<DealerGroup[]>(() => {
    const groupsMap: Record<string, DealerGroup> = {};

    products.forEach((product) => {
      const dId = product.dealerId || 'unknown';
      const profile = dealersMap[dId];

      if (!groupsMap[dId]) {
        groupsMap[dId] = {
          dealerId: dId,
          dealerName: profile?.shopName || product.dealerName || product.dealer?.shopName || 'Unknown Shop',
          dealerOwnerName:
            profile?.userFullName || profile?.fullName || product.dealerOwnerName || product.dealer?.userFullName || 'N/A',
          dealerAddress: profile?.address || product.dealerAddress || product.dealer?.address || 'Address not provided',
          products: [],
        };
      }
      groupsMap[dId].products.push(product);
    });

    return Object.values(groupsMap);
  }, [products, dealersMap]);

  // Filtered dealer groups based on search term
  const filteredDealerGroups = useMemo(() => {
    if (!search.trim()) return dealerGroups;
    const term = search.toLowerCase();
    return dealerGroups.filter(
      (g) =>
        g.dealerName.toLowerCase().includes(term) ||
        g.dealerOwnerName.toLowerCase().includes(term) ||
        g.dealerAddress.toLowerCase().includes(term)
    );
  }, [dealerGroups, search]);

  // Currently selected dealer group
  const activeDealerGroup = useMemo(() => {
    if (!selectedDealerId) return null;
    return dealerGroups.find((g) => g.dealerId === selectedDealerId) || null;
  }, [dealerGroups, selectedDealerId]);

  // Handle Approve Product
  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product approved successfully');
    } catch {
      toast.error('Failed to approve product');
    }
  };

  // Handle Reject Product
  const handleReject = async () => {
    if (!rejectId || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setIsRejecting(true);
    try {
      await adminApi.rejectProduct(rejectId, { rejectionReason });
      setProducts((prev) => prev.filter((p) => p.id !== rejectId));
      setRejectId(null);
      setRejectionReason('');
      toast.success('Product rejected');
    } catch {
      toast.error('Failed to reject product');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <LoadingProgress isLoading={isLoading} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Pending Products by Dealer</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Select a dealer to view and manage all their pending product approval requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {dealerGroups.length} {dealerGroups.length === 1 ? 'Dealer' : 'Dealers'} with Pending Requests
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <Input
            placeholder="Search by dealer name, shop, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Dealers Table / List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredDealerGroups.length === 0 ? (
          <EmptyState
            icon="✅"
            title={search ? 'No matching dealers found' : 'No pending product requests'}
            description={
              search
                ? 'Try adjusting your search criteria.'
                : 'All dealer product requests have been reviewed.'
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Dealer Owner
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Shop Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Address
                    </th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Pending Requests
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {filteredDealerGroups.map((group) => (
                    <tr
                      key={group.dealerId}
                      className="group cursor-pointer transition-colors hover:bg-neutral-50"
                      onClick={() => setSelectedDealerId(group.dealerId)}
                    >
                      {/* Dealer Owner Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                            {group.dealerOwnerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 text-sm">
                              {group.dealerOwnerName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Shop Name */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                        <div className="flex items-center gap-2 font-medium">
                          <span>🏬</span>
                          <span>{group.dealerName}</span>
                        </div>
                      </td>

                      {/* Dealer Address */}
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-400">📍</span>
                          <span>{group.dealerAddress}</span>
                        </div>
                      </td>

                      {/* Pending Count */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                          {group.products.length} {group.products.length === 1 ? 'Request' : 'Requests'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDealerId(group.dealerId);
                          }}
                        >
                          View Product Requests ({group.products.length})
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dealer Requests Detail Modal */}
        {activeDealerGroup && (
          <Modal
            isOpen={!!activeDealerGroup}
            onClose={() => setSelectedDealerId(null)}
            title={`Pending Requests for ${activeDealerGroup.dealerName}`}
            size="xl"
          >
            <div className="space-y-6">
              {/* Dealer Overview Card */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Dealer Owner</span>
                    <p className="font-semibold text-neutral-900 mt-0.5">{activeDealerGroup.dealerOwnerName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Shop Name</span>
                    <p className="font-semibold text-neutral-900 mt-0.5">🏬 {activeDealerGroup.dealerName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Dealer Address</span>
                    <p className="font-medium text-neutral-700 mt-0.5">📍 {activeDealerGroup.dealerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-600">
                          Product Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-600">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-600">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {activeDealerGroup.products.map((product) => (
                        <tr key={product.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                            {product.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-600">
                            {product.categoryName || 'General'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge status={product.approvalStatus} />
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleApprove(product.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setRejectId(product.id);
                                  setRejectionReason('');
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Close Footer */}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedDealerId(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Rejection Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!rejectId}
          onClose={() => setRejectId(null)}
          onConfirm={handleReject}
          title="Reject Product Request"
          description={
            <div className="space-y-2">
              <p className="text-sm text-neutral-600">
                Please provide a reason for rejecting this product request:
              </p>
              <textarea
                className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
              />
            </div>
          }
          confirmText="Reject Product"
          isLoading={isRejecting}
        />
      </div>
    </>
  );
}

export default function PendingProductsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Pending Products">
        <PendingProductsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
