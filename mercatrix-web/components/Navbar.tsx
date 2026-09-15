"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Store, Search, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { authApi } from '@/lib/api/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const cartItems = useCartStore(state => state.items);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/vendor')) {
    return null;
  }

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm' 
          : 'bg-background/0 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
              Mercatrix<span className="text-primary"></span>
            </Link>
            
            <div className="hidden md:flex relative group ml-4">
              <form 
                className="relative flex items-center w-64"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const q = formData.get('search')?.toString().trim();
                  if (q) {
                    window.location.href = `/products?q=${encodeURIComponent(q)}`;
                  } else {
                    window.location.href = '/products';
                  }
                }}
              >
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  name="search"
                  type="text" 
                  placeholder="Search products..." 
                  className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:ring-1 transition-all rounded-full"
                />
              </form>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Products
            </Link>
            {user && (
              <Link href="/orders" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-1.5">
                Orders
              </Link>
            )}
            {!user ? (
              <Link href="/signup?tab=vendor" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-1.5">
                <Store className="w-4 h-4" /> Become a Seller
              </Link>
            ) : (
              <Link 
                href={user.role === 'SUPER_ADMIN' ? '/admin/dashboard' : user.role === 'VENDOR' ? '/vendor/dashboard' : '/'} 
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
            )}
            
            <div className="flex items-center gap-4 border-l border-border pl-6">
              <ThemeToggle />
              
              <Link href="/cart" className="relative group">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </Button>
                {mounted && cartItems.length > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Link>
              
              {!user ? (
                <Link href="/login">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      authApi.logout().then(() => {
                        setUser(null);
                        window.location.href = '/login';
                      });
                    }} 
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </div>

        </div>
      </div>
    </nav>
  );
}