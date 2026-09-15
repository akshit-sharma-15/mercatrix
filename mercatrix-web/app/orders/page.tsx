'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Search, 
  Check, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCustomerOrders } from '@/lib/api/orders';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

export default function OrdersMasterPage() {
  const { user } = useAuthStore();
  const { data: orders = [], isLoading, isFetching } = useCustomerOrders({ refetchInterval: 3000 });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED'>('ALL');

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'PROCESSING': return 1;
      case 'SHIPPED': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Confirmed', key: 'PENDING' },
    { label: 'Atelier Processing', key: 'PROCESSING' },
    { label: 'In Transit', key: 'SHIPPED' },
    { label: 'Delivered', key: 'DELIVERED' },
  ];

  // Filtering
  const filteredOrders = orders.filter((order: any) => {
    const q = searchQuery.toLowerCase();
    const subs: any[] = order.subOrders || order.sub_orders || [];
    const matchesId = order.id.toLowerCase().includes(q);
    const matchesItem = subs.some((so: any) => 
      (so.orderItems || so.items || []).some((item: any) => 
        (item.variant?.product?.title || item.title)?.toLowerCase().includes(q)
      )
    );
    const matchesAwb = subs.some((so: any) => 
      (so.tracking_id || so.tracking_number)?.toLowerCase().includes(q) || 
      (so.delivery_partner || so.deliveryPartner)?.toLowerCase().includes(q)
    );
    const matchesQuery = matchesId || matchesItem || matchesAwb;

    if (!matchesQuery) return false;

    if (activeFilter === 'ACTIVE') {
      return subs.some((so: any) => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(so.status));
    }
    if (activeFilter === 'DELIVERED') {
      return subs.length > 0 && subs.every((so: any) => so.status === 'DELIVERED');
    }
    return true;
  });

  const totalOrdersCount = orders.length;
  const activeDispatchesCount = orders.reduce((acc: number, o: any) => {
    const subs: any[] = o.subOrders || o.sub_orders || [];
    const activeSubs = subs.filter((so: any) => ['PROCESSING', 'SHIPPED'].includes(so.status)).length;
    return acc + activeSubs;
  }, 0);
  const deliveredCount = orders.reduce((acc: number, o: any) => {
    const subs: any[] = o.subOrders || o.sub_orders || [];
    const delSubs = subs.filter((so: any) => so.status === 'DELIVERED').length;
    return acc + delSubs;
  }, 0);
  const totalSpend = orders
    .filter((o: any) => o.payment_status === 'SUCCESS')
    .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  return (
    <div className="min-h-screen pt-24 pb-28 bg-zinc-50/50 dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb & Live Sync Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/profile" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Account</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-medium">Orders & Telemetry</span>
          </div>

          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Live Telemetry Active • Updates Without Reload</span>
          </div>
        </div>

        {/* Master Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Customer Concierge</span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
              Consignment & Order Hub
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 mt-1.5">
              End-to-end telemetry, carrier AWB tracking, and split-order atelier fulfillment status.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold h-9 px-4">
              <Link href="/products">
                Explore Catalog <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Analytics Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">Total Orders</span>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-zinc-900 dark:text-white mt-1">{totalOrdersCount}</p>
          </div>
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">In Transit</span>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-purple-600 dark:text-purple-400 mt-1">{activeDispatchesCount}</p>
          </div>
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">Delivered</span>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">{deliveredCount}</p>
          </div>
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">Total Investment</span>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-zinc-900 dark:text-white mt-1">₹{totalSpend.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Order ID, AWB Code, or Product Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
            {(['ALL', 'ACTIVE', 'DELIVERED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                  activeFilter === tab
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All Orders' : tab === 'ACTIVE' ? 'Active Dispatches' : 'Completed'}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="p-16 text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-zinc-900 border-t-transparent dark:border-white dark:border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-zinc-400">Loading your verified order consignments...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-4 bg-white/50 dark:bg-zinc-900/30">
            <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              {searchQuery ? 'No matching orders found' : 'No consignments in your order history'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {searchQuery 
                ? 'Try searching with a different tracking AWB number, product name, or clear the search query.'
                : 'Browse our curated ateliers to place your first luxury purchase with escrow fulfillment.'}
            </p>
            <Button asChild size="sm" className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Link href="/products">Browse Boutique Catalog</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order: any) => {
              const shippingSnapshot = order.shipping_address || (order.shippingAddress ? {
                name: order.shippingAddress.name,
                street: order.shippingAddress.street,
                locality: order.shippingAddress.locality,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                pincode: order.shippingAddress.pincode,
                phone: order.shippingAddress.phone,
              } : null);

              return (
                <Card key={order.id} className="rounded-3xl border-zinc-200/80 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-900/60 overflow-hidden">
                  
                  {/* Order Top Bar */}
                  <div className="p-5 sm:p-6 bg-zinc-50/80 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-sm">
                    <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                      <div>
                        <span className="text-zinc-400 uppercase font-bold text-xs tracking-wider block">Order ID</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm sm:text-base">#{order.id.slice(0, 8)}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.id);
                              toast.success('Order ID copied');
                            }}
                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-400 uppercase font-bold text-xs tracking-wider block">Date Placed</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block text-sm">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div>
                        <span className="text-zinc-400 uppercase font-bold text-xs tracking-wider block">Total Amount</span>
                        <span className="font-bold text-zinc-900 dark:text-white text-base sm:text-lg mt-0.5 block">
                          ₹{Number(order.total_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.payment_status === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {order.payment_status === 'SUCCESS' ? 'Escrow Settled' : order.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Consignments / Sub-Orders */}
                  <div className="p-5 sm:p-6 space-y-6">
                    
                    {/* Destination Address snapshot */}
                    {shippingSnapshot && (
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-zinc-900 dark:text-white shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white">Delivery Consignment Destination: </span>
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                            {shippingSnapshot.name} ({shippingSnapshot.phone}) — {shippingSnapshot.street}, {shippingSnapshot.locality ? `${shippingSnapshot.locality}, ` : ''}{shippingSnapshot.city}, {shippingSnapshot.state} {shippingSnapshot.pincode}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Suborders */}
                    {(order.subOrders || order.sub_orders || []).map((subOrder: any) => {
                      const vendorName = subOrder.vendor?.business_name || subOrder.vendor?.vendorProfile?.business_name || subOrder.vendor?.store_name || 'Mercatrix Atelier';
                      const status = subOrder.status || 'PENDING';
                      const currentStepIdx = getStepIndex(status);
                      const isCancelled = status === 'CANCELLED';
                      const trackingCode = subOrder.tracking_id || subOrder.tracking_number;
                      const carrierName = subOrder.delivery_partner || subOrder.deliveryPartner;
                      const itemsList = subOrder.orderItems || subOrder.items || [];

                      return (
                        <div key={subOrder.id} className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 space-y-5 bg-white dark:bg-zinc-900/30">
                          
                          {/* Consignment Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-serif font-bold text-base sm:text-lg text-zinc-900 dark:text-white block leading-tight">
                                  {vendorName}
                                </span>
                                <span className="text-xs text-zinc-400 font-mono">
                                  Consignment #{subOrder.id.slice(0, 8)}
                                </span>
                              </div>
                            </div>

                            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              isCancelled
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                : status === 'DELIVERED'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : status === 'SHIPPED'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}>
                              {status}
                            </span>
                          </div>

                          {/* 4-Step Telemetry Stepper */}
                          {!isCancelled ? (
                            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                              <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                                <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />
                                <div 
                                  className="absolute top-4 left-4 h-0.5 bg-zinc-900 dark:bg-white -z-0 transition-all duration-500" 
                                  style={{ width: `${(currentStepIdx / 3) * 100}%` }}
                                />

                                {steps.map((step, idx) => {
                                  const isCompleted = idx < currentStepIdx;
                                  const isCurrent = idx === currentStepIdx;

                                  return (
                                    <div key={step.key} className="flex flex-col items-center relative z-10">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        isCompleted || isCurrent
                                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 ring-4 ring-white dark:ring-zinc-900 shadow-md'
                                          : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                      }`}>
                                        {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                                      </div>
                                      <span className={`text-xs sm:text-sm mt-2 font-semibold tracking-tight text-center ${
                                        isCurrent 
                                          ? 'text-zinc-900 dark:text-white font-bold' 
                                          : isCompleted 
                                          ? 'text-zinc-700 dark:text-zinc-300' 
                                          : 'text-zinc-400 dark:text-zinc-500'
                                      }`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Courier AWB Telemetry Card */}
                              {(trackingCode || carrierName) && (
                                <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-sm">
                                  <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-sm">
                                      <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2.5">
                                        <span className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                                          {carrierName || 'Courier Partner'}
                                        </span>
                                        {trackingCode && (
                                          <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 font-bold border border-zinc-300 dark:border-zinc-700">
                                            AWB: {trackingCode}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Consignment transit telemetry synced in real-time.
                                      </p>
                                    </div>
                                  </div>

                                  {trackingCode && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-full text-xs font-semibold gap-1.5 h-9 px-4 border-zinc-300 dark:border-zinc-700"
                                      onClick={() => {
                                        navigator.clipboard.writeText(trackingCode);
                                        toast.success(`AWB tracking code "${trackingCode}" copied to clipboard`);
                                      }}
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      Copy AWB Code
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                              This consignment was cancelled. Platform settlement is being refunded.
                            </div>
                          )}

                          {/* Consignment Items */}
                          <div className="space-y-3">
                            {itemsList.map((item: any) => {
                              const product = item.variant?.product;
                              const imageUrl = product?.images?.[0]?.image_url || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                              const attributes = item.variant?.attributes || item.attributes;
                              const title = product?.title || item.title || 'Luxury Item';
                              const unitPrice = Number(item.price_at_purchase || item.price || 0);

                              return (
                                <div key={item.id} className="flex items-center justify-between text-xs p-3 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50">
                                  <div className="flex items-center gap-4">
                                    <img 
                                      src={imageUrl} 
                                      alt={title}
                                      className="w-14 h-14 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 shrink-0" 
                                    />
                                    <div>
                                      <span className="font-medium text-zinc-900 dark:text-white text-xs block">
                                        {title}
                                      </span>

                                      {/* Variant Pills */}
                                      {attributes && typeof attributes === 'object' && Object.keys(attributes).length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                          {Object.entries(attributes).map(([k, val]) => (
                                            <span key={k} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                              {k.charAt(0).toUpperCase() + k.slice(1)}: {String(val)}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      <span className="text-zinc-400 text-[11px] mt-1 block">
                                        Qty: {item.quantity} • ₹{unitPrice.toLocaleString('en-IN')} each
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className="font-bold text-zinc-900 dark:text-white text-sm block">
                                      ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      );
                    })}

                  </div>

                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
