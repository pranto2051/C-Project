'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { dealerApi, publicApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Input, Select, Card, CardBody, CardFooter } from '@/components/ui';
import type { Category, Product } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    sku: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          dealerApi.getProduct(params.id as string),
          publicApi.getCategories(),
        ]);
        const product = productRes.data;
        if (product) {
          setFormData({
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            stockQuantity: String(product.stockQuantity),
            categoryId: product.categoryId,
            sku: product.sku || '',
          });
        }
        setCategories(categoriesRes.data);
      } catch {
        toast.error('Failed to load product');
      }
    };
    fetchData();
  }, [params.id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.stockQuantity || Number(formData.stockQuantity) < 0) newErrors.stockQuantity = 'Stock must be 0 or greater';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await dealerApi.updateProduct(params.id as string, {
        name: formData.name,
        description: formData.description || undefined,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: formData.categoryId,
        sku: formData.sku || undefined,
      });
      toast.success('Product updated successfully!');
      router.push('/dealer/products');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
  <DashboardLayout allowedRoles={['Dealer']} title="Edit Product">

    <div className="mx-auto w-full max-w-6xl">

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Edit Product
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update your product information and inventory details.
            </p>
          </div>

          {/* Product Edit Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-8.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 8.5-8.5z"
              />
            </svg>

            Editing Product
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_15px_50px_-20px_rgba(0,0,0,0.15)]">

        {/* Card Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/30 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">

            {/* Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-md shadow-indigo-500/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Product Information
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Make changes to the product details below.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CardBody className="p-6 sm:p-8">

          <form
            id="edit-product-form"
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* Basic Information */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-indigo-600" />

                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Product Name */}
                <div className="md:col-span-2">
                  <Input
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    error={errors.name}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Price */}
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  error={errors.price}
                  placeholder="0.00"
                  required
                />

                {/* Stock */}
                <Input
                  label="Stock Quantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stockQuantity: e.target.value,
                    }))
                  }
                  error={errors.stockQuantity}
                  placeholder="Enter stock quantity"
                  required
                />

                {/* Category */}
                <Select
                  label="Category"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  error={errors.categoryId}
                  required
                />

                {/* SKU */}
                <Input
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sku: e.target.value,
                    }))
                  }
                  placeholder="Enter SKU"
                />
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-slate-100 pt-7">

              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-indigo-600" />

                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  Description
                </h3>
              </div>

              <div className="relative">

                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Product Description
                </label>

                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Write a short description about this product..."
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-slate-400">
                    Optional
                  </span>
                </div>
              </div>
            </div>

          </form>
        </CardBody>

        {/* Footer */}
        <CardFooter className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

          {/* Cancel hint */}
          <p className="hidden text-xs text-slate-400 sm:block">
            Review all information before updating.
          </p>

          <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full rounded-xl px-6 sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="edit-product-form"
              isLoading={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 font-semibold shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                Update Product
              </span>
            </Button>

          </div>
        </CardFooter>
      </Card>
    </div>

  </DashboardLayout>
</ProtectedRoute>
  );
}
