'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  KeyRound, 
  ShieldCheck, 
  BellRing, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Store,
  Camera,
  Trash2,
  Upload,
  User as UserIcon,
  Plus,
  Check,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Building2,
  Home as HomeIcon,
  ChevronRight,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { 
  useAddresses, 
  useCreateAddress, 
  useDeleteAddress, 
  useSetDefaultAddress,
  useCustomerOrders,
  NewAddressInput 
} from '@/lib/api/orders';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address queries & mutations
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const { mutateAsync: createAddressMutation, isPending: isCreatingAddress } = useCreateAddress();
  const { mutateAsync: deleteAddressMutation } = useDeleteAddress();
  const { mutateAsync: setDefaultAddressMutation } = useSetDefaultAddress();
  
  // Orders query
  const { data: orders = [], isLoading: ordersLoading } = useCustomerOrders();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [newAddressForm, setNewAddressForm] = useState<NewAddressInput>({
    name: '',
    phone: '',
    alternatePhone: '',
    pincode: '',
    locality: '',
    street: '',
    city: '',
    state: '',
    landmark: '',
    addressType: 'HOME',
    saveAddress: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      // Pre-fill address form with user's name & phone
      setNewAddressForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (isEditing) {
      setIsLoading(true);
      try {
        const updatedUser = await authApi.updateProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
        setUser(updatedUser);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error('Failed to update profile', error);
        toast.error('Failed to update profile');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const updatedUser = await authApi.updateProfile({ avatar_url: base64String });
        setUser(updatedUser);
        toast.success('Profile picture updated');
      } catch (error) {
        toast.error('Failed to update profile picture');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = async () => {
    try {
      const updatedUser = await authApi.updateProfile({ avatar_url: '' });
      setUser(updatedUser);
      toast.success('Profile picture removed');
    } catch (error) {
      toast.error('Failed to remove profile picture');
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.name.trim() || !newAddressForm.phone.trim() || !newAddressForm.pincode.trim() || !newAddressForm.street.trim() || !newAddressForm.city.trim() || !newAddressForm.state.trim()) {
      toast.error('Please fill in all mandatory fields');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(newAddressForm.phone.trim())) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!/^\d{6}$/.test(newAddressForm.pincode.trim())) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }

    try {
      await createAddressMutation(newAddressForm);
      toast.success('Address saved to profile!');
      setShowAddAddress(false);
      setNewAddressForm({
        name: user?.name || '',
        phone: user?.phone || '',
        alternatePhone: '',
        pincode: '',
        locality: '',
        street: '',
        city: '',
        state: '',
        landmark: '',
        addressType: 'HOME',
        saveAddress: true,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddressMutation(id);
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddressMutation(id);
      toast.success('Default address updated');
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };

  const displayUser = {
    fullName: user?.name || 'Customer',
    email: user?.email || '',
    phone: user?.phone || 'Not added',
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
    role: user?.role || 'CUSTOMER',
    status: user?.is_active !== false ? 'Active' : 'Inactive'
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-zinc-50/50 dark:bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
            Account & Preferences
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'profile'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'addresses'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Addresses {addresses.length > 0 && <span className="opacity-70">({addresses.length})</span>}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Orders {orders.length > 0 && <span className="opacity-70">({orders.length})</span>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* User Header Card (Spans full width on top) */}
          <Card className="md:col-span-3 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 focus:outline-none relative bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer transition-all hover:ring-2 hover:ring-zinc-900 dark:hover:ring-white hover:ring-offset-2">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={displayUser.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-9 h-9 text-zinc-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New
                  </DropdownMenuItem>
                  {user?.avatar_url && (
                    <DropdownMenuItem onClick={handleRemoveImage} className="cursor-pointer text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white mb-1">
                {displayUser.fullName}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
                {displayUser.email}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Phone: {displayUser.phone} • Member since: {displayUser.memberSince}
              </p>
            </div>

            <div className="flex shrink-0 gap-3 mt-4 md:mt-0">
              <div className="px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                {displayUser.role} <span className="w-1 h-1 rounded-full bg-current opacity-50"></span> {displayUser.status}
              </div>
            </div>
          </Card>

          {/* Main Content Area (Spans 2 columns) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* TAB 1: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <>
                <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <div>
                      <CardTitle className="font-serif text-xl">Personal Information</CardTitle>
                      <CardDescription>Update your contact details and display preferences</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full"
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Details'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Full Name</Label>
                        <Input 
                          id="fullName" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          disabled={!isEditing || isLoading}
                          className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={!isEditing || isLoading}
                          className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="phone" className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Primary Contact Phone</Label>
                        <Input 
                          id="phone" 
                          value={formData.phone}
                          placeholder="e.g. 9876543210"
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={!isEditing || isLoading}
                          className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg"
                        />
                        <p className="text-xs text-zinc-400">Synced automatically with your delivery addresses for seamless courier communication.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Security Card */}
                <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Account Settings & Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left group">
                      <div className="flex items-center gap-4">
                        <KeyRound className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                        <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">Change Password</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left group">
                      <div className="flex items-center gap-4">
                        <ShieldCheck className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                        <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">Two-Factor Authentication</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* TAB 2: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Saved Delivery Addresses</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Addresses captured at checkout or added manually</p>
                  </div>
                  <Button 
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    size="sm"
                    className="rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {showAddAddress ? 'Cancel' : 'Add New Address'}
                  </Button>
                </div>

                {/* Add New Address Form */}
                {showAddAddress && (
                  <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 p-6">
                    <form onSubmit={handleCreateAddress} className="space-y-4">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">Enter New Delivery Address</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-zinc-500 font-semibold">Full Name *</Label>
                          <Input 
                            value={newAddressForm.name} 
                            onChange={(e) => setNewAddressForm({...newAddressForm, name: e.target.value})}
                            placeholder="Recipient full name" 
                            className="mt-1" 
                            required 
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-500 font-semibold">10-Digit Mobile *</Label>
                          <Input 
                            value={newAddressForm.phone} 
                            onChange={(e) => setNewAddressForm({...newAddressForm, phone: e.target.value})}
                            placeholder="e.g. 9876543210" 
                            maxLength={10} 
                            className="mt-1" 
                            required 
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-500 font-semibold">PIN Code *</Label>
                          <Input 
                            value={newAddressForm.pincode} 
                            onChange={(e) => setNewAddressForm({...newAddressForm, pincode: e.target.value})}
                            placeholder="6-digit PIN code" 
                            maxLength={6} 
                            className="mt-1" 
                            required 
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-500 font-semibold">Locality / Colony *</Label>
                          <Input 
                            value={newAddressForm.locality} 
                            onChange={(e) => setNewAddressForm({...newAddressForm, locality: e.target.value})}
                            placeholder="Area / Sector" 
                            className="mt-1" 
                            required 
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs text-zinc-500 font-semibold">Address (House / Street) *</Label>
                          <Input 
                            value={newAddressForm.street} 
                            onChange={(e) => setNewAddressForm({...newAddressForm, street: e.target.value})}
                            placeholder="Flat, House no., Building, Street" 
                            className="mt-1" 
                            required 
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-500 font-semibold">City / Town *</Label>
                          <Input 
                            value={newAddressForm.city} 
                            onChange={(e) => setNewAddressForm({...newAddressForm, city: e.target.value})}
                            placeholder="City" 
                            className="mt-1" 
                            required 
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-500 font-semibold">State *</Label>
                          <Input 
                            value={newAddressForm.state} 
                            onChange={(e) => setNewAddressForm({...newAddressForm, state: e.target.value})}
                            placeholder="State" 
                            className="mt-1" 
                            required 
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-500 font-semibold">Landmark (Optional)</Label>
                          <Input 
                            value={newAddressForm.landmark || ''} 
                            onChange={(e) => setNewAddressForm({...newAddressForm, landmark: e.target.value})}
                            placeholder="Nearby landmark" 
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-500 font-semibold">Address Type</Label>
                          <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input 
                                type="radio" 
                                name="addressType" 
                                checked={newAddressForm.addressType === 'HOME'}
                                onChange={() => setNewAddressForm({...newAddressForm, addressType: 'HOME'})}
                              />
                              Home
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input 
                                type="radio" 
                                name="addressType" 
                                checked={newAddressForm.addressType === 'WORK'}
                                onChange={() => setNewAddressForm({...newAddressForm, addressType: 'WORK'})}
                              />
                              Work
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Button type="button" variant="ghost" onClick={() => setShowAddAddress(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isCreatingAddress}
                          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                        >
                          {isCreatingAddress ? 'Saving...' : 'Save Delivery Address'}
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* Addresses List */}
                {addressesLoading ? (
                  <div className="p-8 text-center text-sm text-zinc-400">Loading your saved addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <MapPin className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No saved addresses yet</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Addresses you enter during checkout will automatically be preserved here, or you can add one right now.
                    </p>
                    <Button 
                      onClick={() => setShowAddAddress(true)}
                      size="sm"
                      className="mt-4 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    >
                      Add Address Now
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                      <Card key={addr.id} className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 p-5 relative group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5 flex-1 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                                {addr.name}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                                {addr.address_type === 'WORK' ? <Building2 className="w-3 h-3" /> : <HomeIcon className="w-3 h-3" />}
                                {addr.address_type}
                              </span>
                              {addr.is_default && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">
                              {addr.street}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - <span className="font-medium text-zinc-900 dark:text-white">{addr.pincode}</span>
                            </p>
                            {addr.landmark && (
                              <p className="text-xs text-zinc-400">Landmark: {addr.landmark}</p>
                            )}
                            <p className="text-xs text-zinc-500 font-medium pt-1">
                              Phone: <span className="text-zinc-800 dark:text-zinc-200 font-mono">{addr.phone}</span>
                              {addr.alternate_phone && <span className="text-zinc-400"> • Alt: {addr.alternate_phone}</span>}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!addr.is_default && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSetDefault(addr.id)}
                                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-8"
                              >
                                Set as Default
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-zinc-400 hover:text-destructive h-8 w-8 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CUSTOMER ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Order History</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Track your deliveries and view frozen shipping address records</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold gap-1.5 self-start sm:self-auto border-zinc-300 dark:border-zinc-700">
                    <Link href="/orders">
                      Master Order Tracking Hub &rarr;
                    </Link>
                  </Button>
                </div>

                {ordersLoading ? (
                  <div className="p-8 text-center text-sm text-zinc-400">Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Package className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No orders placed yet</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Explore our catalog and place your first order with secure doorstep delivery.
                    </p>
                    <Button asChild size="sm" className="mt-4 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                      <Link href="/products">Explore Catalog</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => {
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
                        <Card key={order.id} className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 overflow-hidden">
                          <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-zinc-400 uppercase font-semibold">Order Placed</span>
                                <p className="font-medium text-zinc-800 dark:text-zinc-200">
                                  {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                              <div>
                                <span className="text-zinc-400 uppercase font-semibold">Total</span>
                                <p className="font-bold text-zinc-900 dark:text-white">
                                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                {order.payment_status}
                              </span>
                              <span className="text-zinc-400 font-mono text-[11px]">#{order.id.slice(0, 8)}</span>
                            </div>
                          </div>

                          <div className="p-5 space-y-4">
                            {/* Delivery Address Snapshot */}
                            {shippingSnapshot && (
                              <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-xl p-3 text-xs border border-zinc-100 dark:border-zinc-800/80 flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-zinc-900 dark:text-white shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-zinc-900 dark:text-white">Delivered To: </span>
                                  <span className="text-zinc-700 dark:text-zinc-300">
                                    {shippingSnapshot.name} ({shippingSnapshot.phone}) — {shippingSnapshot.street}, {shippingSnapshot.locality ? `${shippingSnapshot.locality}, ` : ''}{shippingSnapshot.city}, {shippingSnapshot.state} {shippingSnapshot.pincode}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* SubOrders / Items & Tracking */}
                            {order.subOrders?.map((subOrder: any) => {
                              const vendorName = subOrder.vendor?.business_name || subOrder.vendor?.vendorProfile?.business_name || 'Mercatrix Partner';
                              const status = subOrder.status || 'PENDING';
                              
                              // Tracking stages logic
                              const steps = [
                                { label: 'Confirmed', key: 'PENDING' },
                                { label: 'Atelier Processing', key: 'PROCESSING' },
                                { label: 'Shipped & In Transit', key: 'SHIPPED' },
                                { label: 'Delivered', key: 'DELIVERED' }
                              ];

                              const getStepIndex = (st: string) => {
                                switch (st) {
                                  case 'PENDING': return 0;
                                  case 'PROCESSING': return 1;
                                  case 'SHIPPED': return 2;
                                  case 'DELIVERED': return 3;
                                  default: return 0;
                                }
                              };

                              const currentStepIdx = getStepIndex(status);
                              const isCancelled = status === 'CANCELLED';

                              return (
                                <div key={subOrder.id} className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 space-y-4">
                                  {/* Suborder Header */}
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                      <span className="font-semibold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                                        Fulfilled by: <span className="underline decoration-zinc-400">{vendorName}</span>
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-mono text-zinc-400">Sub-Order #{subOrder.id.slice(0, 8)}</span>
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                                  </div>

                                  {/* Tracking Stepper */}
                                  {!isCancelled ? (
                                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                      <div className="flex items-center justify-between relative">
                                        <div className="absolute top-3 left-3 right-3 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />
                                        <div 
                                          className="absolute top-3 left-3 h-0.5 bg-zinc-900 dark:bg-white -z-0 transition-all duration-500" 
                                          style={{ width: `${(currentStepIdx / 3) * 100}%` }}
                                        />

                                        {steps.map((step, idx) => {
                                          const isCompleted = idx < currentStepIdx;
                                          const isCurrent = idx === currentStepIdx;

                                          return (
                                            <div key={step.key} className="flex flex-col items-center relative z-10">
                                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                                isCompleted || isCurrent
                                                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 ring-4 ring-white dark:ring-zinc-900 shadow-sm'
                                                  : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                                              }`}>
                                                {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                                              </div>
                                              <span className={`text-[10px] mt-1.5 font-medium tracking-tight text-center ${
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

                                      {/* Courier & Dispatch Tracking Card */}
                                      {(subOrder.tracking_id || subOrder.delivery_partner) && (
                                        <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center">
                                              <Truck className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-semibold text-zinc-900 dark:text-white">
                                                  {subOrder.delivery_partner || 'Direct Courier'}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 font-mono text-zinc-700 dark:text-zinc-300">
                                                  AWB: {subOrder.tracking_id || 'Generating...'}
                                                </span>
                                              </div>
                                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                Package in dispatch network. Real-time carrier scans active.
                                              </p>
                                            </div>
                                          </div>

                                          {subOrder.tracking_id && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 text-xs rounded-full gap-1.5 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                              onClick={() => {
                                                navigator.clipboard.writeText(subOrder.tracking_id);
                                                toast.success('Tracking ID copied to clipboard');
                                              }}
                                            >
                                              <Copy className="w-3 h-3" />
                                              Copy AWB
                                            </Button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                                      This consignment was cancelled. Platform settlement is being processed.
                                    </div>
                                  )}

                                  {/* SubOrder Items List */}
                                  <div className="space-y-3 pt-1">
                                    {subOrder.orderItems?.map((item: any) => {
                                      const product = item.variant?.product;
                                      const imageUrl = product?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                                      const attributes = item.variant?.attributes;

                                      return (
                                        <div key={item.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40">
                                          <div className="flex items-center gap-3">
                                            <img
                                              src={imageUrl}
                                              alt={product?.title || 'Product'}
                                              className="w-12 h-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800"
                                            />
                                            <div>
                                              <span className="text-zinc-900 dark:text-white font-medium block">
                                                {product?.title || 'Luxury Item'}
                                              </span>
                                              
                                              {/* Variant Attributes (Color, Size) */}
                                              {attributes && typeof attributes === 'object' && Object.keys(attributes).length > 0 && (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                  {Object.entries(attributes).map(([key, val]) => (
                                                    <span key={key} className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                      {key.charAt(0).toUpperCase() + key.slice(1)}: {String(val)}
                                                    </span>
                                                  ))}
                                                </div>
                                              )}

                                              <span className="text-zinc-400 text-[11px] mt-0.5 block">Quantity: {item.quantity}</span>
                                            </div>
                                          </div>
                                          <span className="font-semibold text-zinc-900 dark:text-white text-xs">
                                            ₹{(Number(item.price_at_purchase) * item.quantity).toLocaleString('en-IN')}
                                          </span>
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
            )}

          </div>

          {/* Right Column: Quick Shortcuts */}
          <div className="md:col-span-1 space-y-6">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                    <ShoppingBag className="w-5 h-5 text-zinc-900 dark:text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-white">My Orders</h4>
                    <p className="text-xs text-zinc-500">{orders.length} Placed</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('addresses')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-zinc-900 dark:text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-white">Saved Addresses</h4>
                    <p className="text-xs text-zinc-500">{addresses.length} Saved in Profile</p>
                  </div>
                </button>

                {displayUser.role === 'VENDOR' && (
                  <Link href="/vendor/dashboard" className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <Store className="w-5 h-5 text-white dark:text-zinc-900" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-zinc-900 dark:text-white">Vendor Dashboard</h4>
                      <p className="text-xs text-zinc-500">Manage Store</p>
                    </div>
                  </Link>
                )}

                {displayUser.role === 'SUPER_ADMIN' && (
                  <Link href="/admin/dashboard" className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
                    <div className="w-10 h-10 rounded-lg bg-white/10 dark:bg-zinc-900/10 flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-white dark:text-zinc-900" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm font-semibold">Admin Command Center</h4>
                      <p className="text-xs opacity-70">Platform Analytics</p>
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
