'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  ShoppingBag, 
  Package, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Truck, 
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { apiClient } from '@/lib/api/axios';

interface VendorStats {
  totalRevenue: number;
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  productsCount: number;
  isApproved: boolean;
  isBlocked: boolean;
  businessName: string;
}

interface RecentOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  commissionDeducted: number;
  status: string;
  trackingId?: string;
  deliveryPartner?: string;
  date: string;
  itemsCount: number;
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/vendor/stats');
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
      } catch (err: any) {
        console.error('Failed to fetch vendor stats:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Gross Store Revenue',
      value: stats ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '₹0',
      badge: 'Direct Escrow Settlement',
      icon: IndianRupee,
    },
    {
      name: 'Active Fulfillment',
      value: stats ? stats.activeOrdersCount.toString() : '0',
      badge: `${stats?.deliveredOrdersCount || 0} Delivered`,
      icon: ShoppingBag,
    },
    {
      name: 'Active Catalog',
      value: stats ? stats.productsCount.toString() : '0',
      badge: 'Published Products',
      icon: Package,
    },
    {
      name: 'Merchant Status',
      value: stats?.isApproved ? 'Verified Partner' : 'Under Review',
      badge: stats?.isBlocked ? 'Account Restricted' : 'Good Standing',
      icon: ShieldCheck,
      isStatus: true,
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Vendor Command</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            {stats?.businessName ? stats.businessName : 'Merchant Atelier'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time catalog performance, incoming customer sub-orders, and dispatch tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-800 dark:text-zinc-200"
          >
            Catalog ({stats?.productsCount || 0})
          </Link>
          <Link
            href="/vendor/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            Manage Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                {stat.badge}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">{stat.name}</p>
              {loading ? (
                <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded"></div>
              ) : (
                <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {stat.value}
                </h3>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Sub-Orders Table */}
      <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">Incoming Consignment Dispatches</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Orders received specifically for your boutique items</p>
          </div>
          <Link
            href="/vendor/orders"
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            View All Dispatches <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 text-base">Loading store dispatches...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
            <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No customer orders yet</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              When a customer purchases items from your catalog, their order and delivery address will appear here for fulfillment and tracking assignment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sub-Order</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Fulfillment Status</th>
                  <th className="px-6 py-4 font-semibold">Tracking Info</th>
                  <th className="px-6 py-4 font-semibold text-right">Subtotal</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-sm">
                {recentOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                    PROCESSING: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
                    SHIPPED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
                    DELIVERED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                    CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
                  };

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4.5 font-mono text-sm font-bold text-zinc-900 dark:text-white">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="font-semibold text-zinc-900 dark:text-white text-sm">{order.customerName}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${statusColors[order.status] || 'bg-zinc-500/10 text-zinc-400'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-sm">
                        {order.trackingId ? (
                          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                            <Truck className="w-4 h-4 text-zinc-500" />
                            <span className="font-semibold">{order.deliveryPartner || 'Courier'}</span>
                            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 font-bold">({order.trackingId})</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-sm italic">Awaiting dispatch</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-right font-bold text-zinc-900 dark:text-white text-sm">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <Link
                          href="/vendor/orders"
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                        >
                          Update <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
