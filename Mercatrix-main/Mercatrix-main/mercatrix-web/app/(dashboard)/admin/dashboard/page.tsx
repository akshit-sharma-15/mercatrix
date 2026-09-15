'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  Store, 
  Layers, 
  ArrowUpRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building2,
  ChevronRight,
  PackageCheck,
  DollarSign
} from 'lucide-react';
import { apiClient } from '@/lib/api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [selectedVendorForBlock, setSelectedVendorForBlock] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');

  // 1. Fetch live admin stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/stats');
      return data;
    },
    refetchInterval: 30000,
  });

  // 2. Fetch vendors list
  const { data: vendorData, isLoading: vendorsLoading } = useQuery({
    queryKey: ['admin', 'vendors'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/vendors');
      return data.vendors;
    }
  });

  // 3. Vendor mutations
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/admin/vendors/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Vendor approved successfully');
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
      setSelectedVendorForBlock(null);
      setBlockReason('');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => {
      toast.error('Failed to block vendor');
    }
  });

  const stats = statsData?.stats;
  const recentOrders = statsData?.recentOrders || [];
  const pendingVendors = vendorData?.filter((v: any) => !v.vendorProfile?.is_approved && !v.vendorProfile?.is_blocked) || [];

  // Calculate maximum for chart normalization
  const maxDayRevenue = stats?.last7Days ? Math.max(...stats.last7Days.map((d: any) => d.revenue), 1000) : 1000;

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-8 pb-16">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
              Executive Command Center
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Real-time platform GMV, settlement metrics, vendor applications, and order operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchStats()}
              className="rounded-full gap-2 border-zinc-200 dark:border-zinc-800 text-xs h-9"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button 
              asChild 
              size="sm" 
              className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 text-xs h-9"
            >
              <Link href="/admin/categories">Manage Categories</Link>
            </Button>
          </div>
        </div>

        {/* Catchy KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* GMV Card */}
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden relative">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total GMV</span>
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-zinc-900 dark:text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-1">
                {statsLoading ? (
                  <Skeleton className="h-9 w-32" />
                ) : (
                  `₹${(stats?.totalGmv || 0).toLocaleString('en-IN')}`
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Verified Settled Transactions</span>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-zinc-900 to-zinc-400 dark:from-white dark:to-zinc-600" />
          </Card>

          {/* Orders Card */}
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden relative">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Orders</span>
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-zinc-900 dark:text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-1">
                {statsLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  stats?.totalOrders || 0
                )}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {stats?.processingOrders || 0} In Fulfillment • {stats?.deliveredOrders || 0} Delivered
              </p>
            </div>
            <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800" />
          </Card>

          {/* Vendors Card */}
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden relative">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Vendor Pipeline</span>
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Store className="w-4 h-4 text-zinc-900 dark:text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-1">
                {statsLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  stats?.totalVendors || 0
                )}
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{stats?.pendingVendors || 0} Pending Approvals</span>
              </p>
            </div>
            <div className="h-1 w-full bg-amber-500/50" />
          </Card>

          {/* Customers & Products Card */}
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden relative">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Platform Reach</span>
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Users className="w-4 h-4 text-zinc-900 dark:text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-1">
                {statsLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  stats?.totalCustomers || 0
                )}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {stats?.totalProducts || 0} Active Catalog Items
              </p>
            </div>
            <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800" />
          </Card>

        </div>

        {/* 7-Day Revenue Velocity Chart & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Sparkline / Bar Chart (2 cols) */}
          <Card className="lg:col-span-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <CardTitle className="font-serif text-lg">Daily Revenue Velocity</CardTitle>
                <CardDescription className="text-xs">7-day gross transaction flow</CardDescription>
              </div>
              <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                Live Data
              </span>
            </div>

            {/* Custom Interactive SVG / Tailwind Bar Chart */}
            <div className="h-52 w-full flex items-end justify-between gap-3 pt-4 px-2">
              {stats?.last7Days?.map((item: any, idx: number) => {
                const hasRevenue = item.revenue > 0;
                const heightPercent = hasRevenue 
                  ? Math.max(Math.round((item.revenue / maxDayRevenue) * 100), 12)
                  : 4;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2 py-1 rounded shadow-md pointer-events-none mb-1 whitespace-nowrap">
                      {hasRevenue ? `₹${item.revenue.toLocaleString('en-IN')}` : '₹0 Revenue'}
                    </div>
                    {/* Bar */}
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] rounded-t-md transition-all duration-300 ${
                        hasRevenue 
                          ? 'bg-zinc-800 dark:bg-zinc-200 group-hover:bg-zinc-950 dark:group-hover:bg-white' 
                          : 'bg-zinc-200 dark:bg-zinc-800/60'
                      }`}
                    />
                    {/* Day label */}
                    <span className="text-[10px] font-medium text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                      {item.date.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Order Status Breakdown (1 col) */}
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 p-6 flex flex-col justify-between">
            <div>
              <CardTitle className="font-serif text-lg mb-1">Fulfillment Status</CardTitle>
              <CardDescription className="text-xs mb-6">Sub-order logistics distribution</CardDescription>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-zinc-600 dark:text-zinc-400">Processing & In Transit</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {stats?.processingOrders || 0} orders
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(((stats?.processingOrders || 0) / Math.max(stats?.totalOrders || 1, 1)) * 100, 100)}%` }} 
                      className="h-full bg-zinc-900 dark:bg-white rounded-full" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-zinc-600 dark:text-zinc-400">Successfully Delivered</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {stats?.deliveredOrders || 0} orders
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(((stats?.deliveredOrders || 0) / Math.max(stats?.totalOrders || 1, 1)) * 100, 100)}%` }} 
                      className="h-full bg-emerald-500 rounded-full" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-zinc-600 dark:text-zinc-400">Awaiting Settlement / Payment</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {stats?.pendingOrders || 0} orders
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(((stats?.pendingOrders || 0) / Math.max(stats?.totalOrders || 1, 1)) * 100, 100)}%` }} 
                      className="h-full bg-amber-500 rounded-full" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Active Platform Ratio</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {stats?.totalOrders ? '100% Operational' : 'Ready'}
              </span>
            </div>
          </Card>

        </div>

        {/* Priority Action: Pending Vendor Applications */}
        {pendingVendors.length > 0 && (
          <Card className="rounded-2xl border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/10 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Pending Vendor Verification ({pendingVendors.length})
                </h3>
                <p className="text-xs text-zinc-500">
                  Merchants waiting for admin credentials review before listing products.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingVendors.map((vendor: any) => (
                <div key={vendor.id} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white block">
                      {vendor.vendorProfile?.business_name || 'Untitled Atelier'}
                    </span>
                    <span className="text-xs text-zinc-400 block mb-3 font-mono">
                      {vendor.email}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <Button 
                      size="sm"
                      onClick={() => approveMutation.mutate(vendor.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs h-8 rounded-lg"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Approve
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVendorForBlock(vendor.id)}
                      className="text-xs text-destructive border-zinc-200 dark:border-zinc-800 h-8 rounded-lg hover:bg-destructive/10"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Live Recent Orders Feed */}
        <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-200 dark:border-zinc-800/60 p-6">
            <div>
              <CardTitle className="font-serif text-xl font-bold text-zinc-900 dark:text-white">Live Platform Orders</CardTitle>
              <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Latest customer transactions and shipping snapshots</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-950/50">
                <TableRow className="border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm">
                  <TableHead className="font-bold py-4 px-6">Order ID</TableHead>
                  <TableHead className="font-bold py-4 px-6">Customer</TableHead>
                  <TableHead className="font-bold py-4 px-6">Delivery Location</TableHead>
                  <TableHead className="font-bold py-4 px-6">Total Amount</TableHead>
                  <TableHead className="font-bold py-4 px-6">Payment</TableHead>
                  <TableHead className="font-bold py-4 px-6">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-6 py-4"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="px-6 py-4"><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell className="px-6 py-4"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="px-6 py-4"><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-zinc-400 text-sm">
                      No platform orders recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order: any) => (
                    <TableRow key={order.id} className="border-zinc-100 dark:border-zinc-800/60 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <TableCell className="px-6 py-4.5 font-mono font-bold text-zinc-900 dark:text-white">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="px-6 py-4.5">
                        <span className="font-semibold text-zinc-900 dark:text-white text-sm block">{order.customerName}</span>
                        <span className="text-xs text-zinc-400 block mt-0.5">{order.customerEmail}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4.5 text-zinc-600 dark:text-zinc-300 max-w-[200px] truncate text-sm">
                        {order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : 'Direct Doorstep'}
                      </TableCell>
                      <TableCell className="px-6 py-4.5 font-bold font-serif text-zinc-900 dark:text-white text-sm sm:text-base">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="px-6 py-4.5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'SUCCESS' 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4.5 text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
                        {order.date}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Full Vendors Management Table */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-200 dark:border-zinc-800/60 pb-4">
            <div>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Building2 size={18} className="text-zinc-900 dark:text-white" />
                All Registered Vendors
              </CardTitle>
              <CardDescription className="text-xs">Manage merchant profiles, approvals, and compliance</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow className="border-zinc-200 dark:border-zinc-800 text-xs">
                  <TableHead className="font-semibold">Business / Merchant</TableHead>
                  <TableHead className="font-semibold">Email Contact</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : vendorData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-zinc-400 text-xs">
                      No vendors registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  vendorData?.map((vendor: any) => (
                    <TableRow key={vendor.id} className="border-zinc-100 dark:border-zinc-800/60 text-xs">
                      <TableCell className="font-semibold text-zinc-900 dark:text-white">
                        {vendor.vendorProfile?.business_name || 'Independent Artisan'}
                      </TableCell>
                      <TableCell className="font-mono text-zinc-600 dark:text-zinc-400">
                        {vendor.email}
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
                              onClick={() => setSelectedVendorForBlock(vendor.id)}
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

        {/* Block Reason Modal */}
        {selectedVendorForBlock && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white mb-2">Block Vendor Access</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Please provide a compliance reason for blocking this vendor. They will not be able to list or edit products.
              </p>
              <input
                type="text"
                placeholder="Reason (e.g. Terms violation, counterfeit report)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 mb-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setSelectedVendorForBlock(null); setBlockReason(''); }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  disabled={!blockReason.trim() || blockMutation.isPending}
                  onClick={() => blockMutation.mutate({ id: selectedVendorForBlock, reason: blockReason })}
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
