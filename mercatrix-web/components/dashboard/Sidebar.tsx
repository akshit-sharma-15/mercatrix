'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, FolderTree, Settings, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { useState } from 'react';

const VENDOR_NAV = [
  { name: 'Overview', href: '/vendor/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/vendor/products', icon: Package },
  { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
  { name: 'Settings', href: '/vendor/settings', icon: Settings },
];

const ADMIN_NAV = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Vendors', href: '/admin/vendors', icon: Users },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const navItems = user?.role === 'SUPER_ADMIN' ? ADMIN_NAV : VENDOR_NAV;

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/" className="text-xl font-serif font-bold tracking-tight text-foreground">
            Mercatrix<span className="text-primary">.</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            {user?.role === 'SUPER_ADMIN' ? 'Executive Administration' : 'Vendor Portal'}
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-xs' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-muted/60 mb-3 border border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize font-medium">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={handleLogout}>
            <LogOut size={18} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
