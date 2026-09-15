'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  FolderTree, 
  Plus, 
  Trash2, 
  Percent, 
  Package, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { apiClient } from '@/lib/api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    commission_rate: 10.0,
  });

  // 1. Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/categories');
      return data.categories || [];
    }
  });

  // 2. Create category mutation
  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; commission_rate: number }) => {
      const { data } = await apiClient.post('/admin/categories', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Category created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', commission_rate: 10.0 });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create category');
    }
  });

  // 3. Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      toast.success('Category removed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete category');
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    createMutation.mutate({
      name: formData.name.trim(),
      commission_rate: Number(formData.commission_rate)
    });
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
              Catalog Categories & Commission Rates
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Configure marketplace product hierarchy and platform commission tiers.
            </p>
          </div>

          <Button 
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 gap-2 h-9 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        {/* Categories Table */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 overflow-hidden">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/60 pb-4">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <FolderTree size={18} className="text-zinc-900 dark:text-white" />
              Active Categories ({categories.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Platform fees automatically partition during checkout based on the category rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow className="border-zinc-200 dark:border-zinc-800 text-xs">
                  <TableHead className="font-semibold">Category Name</TableHead>
                  <TableHead className="font-semibold">Platform Commission</TableHead>
                  <TableHead className="font-semibold">Associated Products</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-zinc-400 text-xs">
                      No categories configured yet. Click "Add Category" to initialize your catalog.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat: any) => (
                    <TableRow key={cat.id} className="border-zinc-100 dark:border-zinc-800/60 text-xs hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <TableCell className="font-semibold text-zinc-900 dark:text-white">
                        {cat.name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium">
                          <Percent className="w-3 h-3 text-zinc-400" />
                          {Number(cat.commission_rate)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-500 font-medium">
                        {cat._count?.products || 0} products
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteMutation.mutate(cat.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 w-8 text-zinc-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white mb-1">Create New Category</h3>
              <p className="text-xs text-zinc-500 mb-6">
                Define the category name and default platform fee percentage.
              </p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-zinc-500">Category Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fine Horology, High Tech Audio"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-500">Commission Rate (%) *</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 10.0"
                    className="mt-1 font-mono"
                    required
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    This percentage is deducted from vendor payouts during split order settlement.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending || !formData.name.trim()}
                    className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
