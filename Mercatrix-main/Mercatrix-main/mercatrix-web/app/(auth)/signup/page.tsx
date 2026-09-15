'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Store, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[0-9]/, 'Password must contain at least 1 number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least 1 special character');

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
});

const vendorSchema = customerSchema.extend({
  business_name: z.string().min(2, 'Business name is required'),
  phone_number: z.string().min(10, 'Valid phone number is required'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;
type VendorFormValues = z.infer<typeof vendorSchema>;

export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'vendor' ? 'vendor' : 'customer';
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const customerForm = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema) });
  const vendorForm = useForm<VendorFormValues>({ resolver: zodResolver(vendorSchema) });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = activeTab === 'customer' ? '/auth/signup' : '/auth/vendor-signup';
      const response = await apiClient.post(endpoint, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setUser(data.user);
      
      if (data.user.role === 'VENDOR') {
        router.push('/vendor/pending-approval');
      } else {
        router.push('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Signup failed');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px]"
      >
        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 pb-6 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-sm">
              Join Mercatrix and start {activeTab === 'vendor' ? 'selling' : 'shopping'} today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Custom Minimal Tabs */}
            <div className="flex bg-muted/50 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('customer')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'customer' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User size={16} /> Customer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vendor')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'vendor' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Store size={16} /> Vendor
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'customer' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'customer' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                <form
                  onSubmit={activeTab === 'customer' ? customerForm.handleSubmit(onSubmit) : vendorForm.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {activeTab === 'vendor' && (
                    <>
                      <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input
                          {...vendorForm.register('business_name')}
                          className={vendorForm.formState.errors.business_name ? 'border-destructive' : ''}
                        />
                        {vendorForm.formState.errors.business_name && <p className="text-destructive text-xs">{vendorForm.formState.errors.business_name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          {...vendorForm.register('phone_number')}
                          type="tel"
                          className={vendorForm.formState.errors.phone_number ? 'border-destructive' : ''}
                        />
                        {vendorForm.formState.errors.phone_number && <p className="text-destructive text-xs">{vendorForm.formState.errors.phone_number.message}</p>}
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      {...(activeTab === 'customer' ? customerForm.register('name') : vendorForm.register('name'))}
                      className={(activeTab === 'customer' ? customerForm.formState.errors.name : vendorForm.formState.errors.name) ? 'border-destructive' : ''}
                    />
                    {(activeTab === 'customer' ? customerForm.formState.errors.name : vendorForm.formState.errors.name) && (
                      <p className="text-destructive text-xs">
                        {(activeTab === 'customer' ? customerForm.formState.errors.name?.message : vendorForm.formState.errors.name?.message)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      {...(activeTab === 'customer' ? customerForm.register('email') : vendorForm.register('email'))}
                      type="email"
                      className={(activeTab === 'customer' ? customerForm.formState.errors.email : vendorForm.formState.errors.email) ? 'border-destructive' : ''}
                    />
                    {(activeTab === 'customer' ? customerForm.formState.errors.email : vendorForm.formState.errors.email) && (
                      <p className="text-destructive text-xs">
                        {(activeTab === 'customer' ? customerForm.formState.errors.email?.message : vendorForm.formState.errors.email?.message)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        {...(activeTab === 'customer' ? customerForm.register('password') : vendorForm.register('password'))}
                        type={showPassword ? 'text' : 'password'}
                        className={`pr-10 ${(activeTab === 'customer' ? customerForm.formState.errors.password : vendorForm.formState.errors.password) ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {(activeTab === 'customer' ? customerForm.formState.errors.password : vendorForm.formState.errors.password) && (
                      <p className="text-destructive text-xs">
                        {(activeTab === 'customer' ? customerForm.formState.errors.password?.message : vendorForm.formState.errors.password?.message)}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full mt-4"
                  >
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create {activeTab === 'vendor' ? 'Vendor' : ''} Account
                  </Button>
                </form>
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/40 p-4 bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
