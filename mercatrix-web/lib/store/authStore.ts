import { create } from 'zustand';

interface User {
  id: string;
  name?: string;
  phone?: string;
  email: string;
  role: 'SUPER_ADMIN' | 'VENDOR' | 'CUSTOMER';
  is_approved?: boolean;
  avatar_url?: string;
  is_active?: boolean;
  created_at?: string;
  vendor_profile?: {
    id?: string;
    store_name?: string;
    business_name?: string;
    gst_vat_number?: string;
    tax_id?: string;
    escrow_status?: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
