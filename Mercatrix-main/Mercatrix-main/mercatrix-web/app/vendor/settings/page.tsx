'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  FileText, 
  Phone, 
  ShieldCheck, 
  CreditCard, 
  Percent, 
  Save, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { toast } from 'sonner';

export default function VendorSettingsPage() {
  const queryClient = useQueryClient();

  const { data: vendorProfile, isLoading, error } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: async () => {
      const res = await apiClient.get('/vendor/profile');
      return res.data.vendorProfile;
    },
  });

  const [form, setForm] = useState({
    business_name: '',
    gst_vat_number: '',
    tax_id: '',
    phone: '',
  });

  useEffect(() => {
    if (vendorProfile) {
      setForm({
        business_name: vendorProfile.business_name || '',
        gst_vat_number: vendorProfile.gst_vat_number || '',
        tax_id: vendorProfile.tax_id || '',
        phone: vendorProfile.user?.phone || '',
      });
    }
  }, [vendorProfile]);

  const updateMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await apiClient.put('/vendor/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Store settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update store settings');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name.trim()) {
      toast.error('Business name is required');
      return;
    }
    updateMutation.mutate(form);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Merchant Configuration</span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
          Store Settings & Compliance
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your registered brand atelier profile, tax credentials, and escrow disbursement settings.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Failed to load vendor credentials. Please ensure your account has active merchant privileges.</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Settings Form (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/60 pb-5">
              <CardTitle className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
                Atelier Profile
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                Public boutique credentials displayed on customer sub-orders and invoices
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Brand / Business Name *
                    </Label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        value={form.business_name}
                        onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                        placeholder="e.g. Aura Horlogerie Studio"
                        className="pl-10 text-sm h-11 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        GSTIN / VAT Number
                      </Label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          value={form.gst_vat_number}
                          onChange={(e) => setForm({ ...form, gst_vat_number: e.target.value.toUpperCase() })}
                          placeholder="e.g. 27AABCA1234F1Z1"
                          className="pl-10 font-mono text-sm h-11 rounded-xl uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        PAN / Tax ID
                      </Label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          value={form.tax_id}
                          onChange={(e) => setForm({ ...form, tax_id: e.target.value.toUpperCase() })}
                          placeholder="e.g. ABCDE1234F"
                          className="pl-10 font-mono text-sm h-11 rounded-xl uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Operations / Dispatch Phone
                    </Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98200 12345"
                        className="pl-10 text-sm h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 h-11 text-sm font-semibold hover:opacity-90 transition-opacity gap-2"
                    >
                      {updateMutation.isPending ? 'Saving Settings...' : 'Save Store Profile'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info & Payout Status (1 col) */}
        <div className="space-y-5">
          
          {/* Standing Card */}
          <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Merchant Standing</h4>
                <p className="text-[11px] text-zinc-400">Compliance & Trust Tier</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Approval Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {vendorProfile?.is_approved ? 'Verified Partner' : 'Under Review'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Account Health</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {vendorProfile?.is_blocked ? 'Restricted' : 'Good Standing'}
                </span>
              </div>
            </div>
          </Card>

          {/* Settlement Card */}
          <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Escrow Settlement</h4>
                <p className="text-[11px] text-zinc-400">Direct Route Linked</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Route Node</span>
                <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                  {vendorProfile?.razorpay_account_id || 'acc_mercatrix_direct'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Escrow Hold</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">T+2 Post-Delivery</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Net proceeds from customer purchases are held in secure escrow and released upon confirmed carrier delivery.
            </p>
          </Card>

        </div>

      </div>
    </div>
  );
}
