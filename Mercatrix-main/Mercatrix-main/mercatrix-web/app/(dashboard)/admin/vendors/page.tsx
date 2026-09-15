'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  Building2, 
  FileText, 
  ExternalLink, 
  ShieldAlert 
} from 'lucide-react';
import { apiClient } from '@/lib/api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function AdminVendorsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'BLOCKED'>('ALL');
  const [blockModalVendorId, setBlockModalVendorId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['admin', 'vendors'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/vendors');
      return data.vendors || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/admin/vendors/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Vendor profile approved');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => {
      toast.error('Failed to approve vendor');
    }
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiClient.put(`/admin/vendors/${id}/block`, { reason });
    },
    onSuccess: () => {
      toast.success('Vendor access blocked');
      setBlockModalVendorId(null);
      setBlockReason('');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => {
      toast.error('Failed to block vendor');
    }
  });

  const filteredVendors = vendors.filter((v: any) => {
    const businessName = v.vendorProfile?.business_name?.toLowerCase() || '';
    const email = v.email?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch = businessName.includes(q) || email.includes(q);

    if (!matchesSearch) return false;

    if (filterStatus === 'APPROVED') return v.vendorProfile?.is_approved && !v.vendorProfile?.is_blocked;
    if (filterStatus === 'PENDING') return !v.vendorProfile?.is_approved && !v.vendorProfile?.is_blocked;
    if (filterStatus === 'BLOCKED') return v.vendorProfile?.is_blocked;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
              Vendor Directory & Verification
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Review credential documents, approve merchant storefronts, or manage platform compliance.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor or email..."
              className="pl-9 text-xs h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'PENDING', 'APPROVED', 'BLOCKED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all shrink-0 ${
                  filterStatus === status
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Table */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 overflow-hidden">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/60 pb-4">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Building2 size={18} className="text-zinc-900 dark:text-white" />
              Vendors ({filteredVendors.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Merchant storefronts onboarded to Mercatrix
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow className="border-zinc-200 dark:border-zinc-800 text-xs">
                  <TableHead className="font-semibold">Business Name</TableHead>
                  <TableHead className="font-semibold">Email & Phone</TableHead>
                  <TableHead className="font-semibold">GST / Tax ID</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-400 text-xs">
                      No vendors found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor: any) => (
                    <TableRow key={vendor.id} className="border-zinc-100 dark:border-zinc-800/60 text-xs hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <TableCell>
                        <span className="font-semibold text-zinc-900 dark:text-white block">
                          {vendor.vendorProfile?.business_name || 'Independent Artisan'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          ID: {vendor.id.slice(0, 8)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-zinc-800 dark:text-zinc-200 block">{vendor.email}</span>
                        <span className="text-[11px] text-zinc-400">{vendor.phone || 'No phone'}</span>
                      </TableCell>

                      <TableCell className="font-mono text-zinc-600 dark:text-zinc-400">
                        {vendor.vendorProfile?.gst_vat_number || 'Pending Submission'}
                      </TableCell>

                      <TableCell>
                        {vendor.vendorProfile?.is_blocked ? (
                          <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                            Blocked
                          </span>
                        ) : vendor.vendorProfile?.is_approved ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            Pending Review
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!vendor.vendorProfile?.is_approved && !vendor.vendorProfile?.is_blocked && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 text-xs rounded-lg gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              onClick={() => approveMutation.mutate(vendor.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle size={14} /> Approve
                            </Button>
                          )}
                          {!vendor.vendorProfile?.is_blocked ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 text-xs rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              onClick={() => setBlockModalVendorId(vendor.id)}
                            >
                              <XCircle size={14} className="mr-1" /> Block
                            </Button>
                          ) : (
                            <span className="text-[11px] text-zinc-400 italic">
                              Reason: {vendor.vendorProfile.block_reason || 'Compliance'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Block Modal */}
        {blockModalVendorId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white mb-2">Block Vendor Access</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Please provide a compliance reason for blocking this vendor.
              </p>
              <input
                type="text"
                placeholder="Reason (e.g. Terms violation, counterfeit item report)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 mb-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setBlockModalVendorId(null); setBlockReason(''); }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  disabled={!blockReason.trim() || blockMutation.isPending}
                  onClick={() => blockMutation.mutate({ id: blockModalVendorId, reason: blockReason })}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                >
                  Confirm Block
                </Button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
