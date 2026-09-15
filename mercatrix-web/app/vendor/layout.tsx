'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Store, 
  Menu, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/vendor/products', icon: Package },
    { name: 'Orders & Fulfillment', href: '/vendor/orders', icon: ShoppingCart },
    { name: 'Store Settings', href: '/vendor/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await authApi.logout();
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      window.location.href = '/login';
    }
  };

  const storeName = user?.vendor_profile?.business_name || user?.vendor_profile?.store_name || user?.name || 'Partner Atelier';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Topbar */}
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
        
        {/* Left: Mobile trigger & Store branding */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-lg text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <Link href="/vendor/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base sm:text-lg text-foreground tracking-tight leading-none">
                  {storeName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block mt-0.5">
                Mercatrix Merchant Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Actions, Theme Switcher & User profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="hidden sm:inline-flex text-xs font-semibold gap-1.5 rounded-full border-border hover:bg-muted"
          >
            <Link href="/products" target="_blank">
              View Storefront <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>
          </Button>

          {/* Theme Toggle Button */}
          <div className="flex items-center gap-1.5 px-1 py-1 rounded-full border border-border bg-card/60">
            <ThemeToggle />
          </div>

          {/* User info & Sign out */}
          <div className="hidden md:flex items-center gap-3 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs text-foreground border border-border">
              {user?.email?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                {user?.email || 'Merchant'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Vendor
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSignOut}
            className="text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg px-2.5 sm:px-3 h-9"
          >
            <LogOut className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>

        </div>
      </header>

      <div className="flex flex-1 relative">
        
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-16 z-35 md:z-0
          w-72 bg-card border-r border-border
          flex flex-col h-[calc(100vh-4rem)]
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6">
              
              {/* Escrow Status Banner */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Escrow Settlement
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Funds released automatically within 48 hrs of courier delivery confirmation.
                </p>
              </div>

              {/* Navigation Items */}
              <div>
                <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Merchant Workspace
                </p>
                <nav className="space-y-1.5">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

            </div>

            {/* Sidebar Bottom Footer */}
            <div className="pt-6 border-t border-border space-y-3">
              <Link 
                href="/" 
                className="flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <span>Browse Marketplace</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </Link>
              
              <div className="px-2 text-[11px] text-muted-foreground">
                Mercatrix Atelier Suite v2.4 • Secured
              </div>
            </div>

          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-muted/20 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
