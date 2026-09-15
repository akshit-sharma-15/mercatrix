'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  ExternalLink,
  Edit3,
  Phone,
  Mail,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function VendorOrders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'PENDING'>('ALL');
  
  // Selected order for tracking update modal
  const [selectedSubOrder, setSelectedSubOrder] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('SHIPPED');
  const [trackingId, setTrackingId] = useState<string>('');
  const [deliveryPartner, setDeliveryPartner] = useState<string>('Blue Dart Express');

  // 1. Fetch real vendor orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['vendor', 'orders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/vendor/orders');
      return data.orders || [];
    }
  });

  const orders: any[] = ordersData || [];

  // 2. Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ subOrderId, payload }: { subOrderId: string; payload: any }) => {
      const { data } = await apiClient.put(`/vendor/orders/${subOrderId}/status`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Fulfillment & tracking info updated!');
      setSelectedSubOrder(null);
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update order status');
    }
  });

  const generateAwbCode = (partner: string) => {
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    if (partner.includes('Blue Dart')) return `BD-${rand}`;
    if (partner.includes('Delhivery')) return `DEL-${rand}`;
    if (partner.includes('FedEx')) return `FX-${rand}`;
    if (partner.includes('DHL')) return `DHL-${Math.floor(1000000 + Math.random() * 9000000)}`;
    if (partner.includes('DTDC')) return `DTDC-${rand}`;
    return `EXP-${rand}`;
  };

  const handleOpenTrackingModal = (subOrder: any) => {
    setSelectedSubOrder(subOrder);
    const initialStatus = subOrder.status === 'PENDING' ? 'PROCESSING' : subOrder.status;
    const initialPartner = subOrder.deliveryPartner || 'Blue Dart Express';
    setUpdateStatus(initialStatus);
    setDeliveryPartner(initialPartner);
    setTrackingId(subOrder.trackingId || generateAwbCode(initialPartner));
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubOrder) return;

    updateStatusMutation.mutate({
      subOrderId: selectedSubOrder.id,
      payload: {
        status: updateStatus,
        tracking_id: trackingId.trim(),
        delivery_partner: deliveryPartner.trim(),
      }
    });
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      order.id.toLowerCase().includes(q) ||
      order.orderId.toLowerCase().includes(q) ||
      order.customer.name.toLowerCase().includes(q) ||
      order.customer.email.toLowerCase().includes(q) ||
      (order.trackingId && order.trackingId.toLowerCase().includes(q));

    if (!matchesQuery) return false;
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'PROCESSING':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'DELIVERED':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
            Orders & Courier Tracking
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Track customer purchases of your products, print packing details, and provide courier tracking numbers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              type="text" 
              placeholder="Search order or tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PENDING'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shrink-0 ${
              statusFilter === st
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 rounded-2xl">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed">
          <Package className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white">No Orders Found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            When customers purchase your listed items, their orders and frozen delivery snapshots will appear here for fulfillment.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 overflow-hidden">
              
              {/* Order Header Bar */}
              <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-zinc-400 uppercase font-semibold text-[10px]">Sub-Order</span>
                    <p className="font-mono font-bold text-zinc-900 dark:text-white">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 uppercase font-semibold text-[10px]">Order Date</span>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400 uppercase font-semibold text-xs">Your Payout (Net)</span>
                    <p className="font-bold font-serif text-zinc-900 dark:text-white text-lg sm:text-xl">
                      ₹{order.netPayout.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                  <Button 
                    size="sm"
                    onClick={() => handleOpenTrackingModal(order)}
                    className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 text-xs font-semibold h-9 px-4 gap-1.5 shadow-xs"
                  >
                    <Truck className="w-4 h-4" />
                    Update Tracking
                  </Button>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left (2 cols): Ordered Products */}
                <div className="lg:col-span-2 space-y-4">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Consignment Items ({order.items.length})
                  </span>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3.5">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-zinc-400" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-white block line-clamp-1 text-sm sm:text-base">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              {item.attributes?.Color && <span>Color: <b className="text-zinc-700 dark:text-zinc-200">{item.attributes.Color}</b></span>}
                              {item.attributes?.Size && <span>Size: <b className="text-zinc-700 dark:text-zinc-200">{item.attributes.Size}</b></span>}
                              <span>SKU: <span className="font-mono">{item.sku}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-zinc-900 dark:text-white block text-sm sm:text-base">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking info badge if shipped */}
                  {order.trackingId && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5 text-purple-900 dark:text-purple-300">
                        <Truck className="w-4 h-4" />
                        <span>Courier: <b>{order.deliveryPartner || 'Carrier'}</b></span>
                        <span>• Tracking ID: <b className="font-mono text-purple-700 dark:text-purple-200">{order.trackingId}</b></span>
                      </div>
                      <span className="text-xs uppercase font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-md">Live Active</span>
                    </div>
                  )}
                </div>

                {/* Right (1 col): Delivery Address Snapshot */}
                <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl p-5 border border-zinc-200/60 dark:border-zinc-800/80 text-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-2.5">
                      <MapPin className="w-4 h-4 text-zinc-900 dark:text-white" /> Shipping Destination
                    </span>
                    {order.shippingAddress ? (
                      <div className="space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        <p className="font-bold text-zinc-900 dark:text-white text-sm">{order.shippingAddress.name}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{order.shippingAddress.street}, {order.shippingAddress.locality}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{order.shippingAddress.city}, {order.shippingAddress.state} - <span className="font-mono font-bold text-zinc-900 dark:text-white">{order.shippingAddress.pincode}</span></p>
                        {order.shippingAddress.landmark && (
                          <p className="text-zinc-400 text-xs">Landmark: {order.shippingAddress.landmark}</p>
                        )}
                        <p className="text-zinc-800 dark:text-zinc-200 font-mono text-xs font-semibold pt-1">
                          Phone: {order.shippingAddress.phone}
                        </p>
                      </div>
                    ) : (
                      <p className="text-zinc-400 italic text-xs">No address snapshot recorded.</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">Customer:</span> {order.customer.name} ({order.customer.email})
                  </div>
                </div>

              </div>

            </Card>
          ))}
        </div>
      )}

      {/* Tracking / Status Update Modal */}
      {selectedSubOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white mb-1">
              Update Order Fulfillment
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Sub-Order #{selectedSubOrder.id.slice(0, 8)} • Buyer: {selectedSubOrder.customer.name}
            </p>

            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-500">Fulfillment Status *</Label>
                <select
                  value={updateStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setUpdateStatus(newStatus);
                    if (newStatus === 'SHIPPED' && !trackingId) {
                      setTrackingId(generateAwbCode(deliveryPartner));
                    }
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                >
                  <option value="PROCESSING">PROCESSING (Packing / Atelier Preparing)</option>
                  <option value="SHIPPED">SHIPPED (Handed to Carrier Network)</option>
                  <option value="DELIVERED">DELIVERED (Successfully Arrived at Doorstep)</option>
                  <option value="CANCELLED">CANCELLED (Out of Stock / Buyer Request)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-500">Courier / Delivery Partner</Label>
                <select 
                  value={deliveryPartner}
                  onChange={(e) => {
                    const newPartner = e.target.value;
                    setDeliveryPartner(newPartner);
                    setTrackingId(generateAwbCode(newPartner));
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                >
                  <option value="Blue Dart Express">Blue Dart Express (Air Priority)</option>
                  <option value="Delhivery Express">Delhivery Express</option>
                  <option value="FedEx Luxury Priority">FedEx Luxury Priority</option>
                  <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                  <option value="DTDC Air Cargo">DTDC Air Cargo</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-semibold text-zinc-500">AWB Tracking Number</Label>
                  <button
                    type="button"
                    onClick={() => setTrackingId(generateAwbCode(deliveryPartner))}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate AWB
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. BD-84920194"
                    className="text-xs font-mono rounded-xl pr-28 bg-zinc-50 dark:bg-zinc-800/80"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Auto-Filled
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Generated automatically. Buyers will see live consignment tracking on their orders page.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedSubOrder(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Save & Notify Customer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
