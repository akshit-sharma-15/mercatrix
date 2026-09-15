'use client';

import Link from 'next/link';
import { Menu, ExternalLink, ShieldCheck, LogOut, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../ThemeToggle';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <header className="h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
      
      {/* Left: Mobile trigger & Dashboard Title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden rounded-lg" onClick={onMenuClick} aria-label="Open Navigation">
          <Menu size={20} />
        </Button>
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
            Executive Admin
          </h1>
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Platform Active</span>
          </div>
        </div>
      </div>

      {/* Right: Marketplace Link, Theme Toggle, User info */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex text-xs font-semibold rounded-full border-border">
          <Link href="/" target="_blank">
            Public Marketplace <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
          </Link>
        </Button>

        {/* Theme Toggle Button */}
        <div className="flex items-center gap-1.5 px-1 py-1 rounded-full border border-border bg-card/60">
          <ThemeToggle />
        </div>

        {/* Super Admin Info */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border text-left">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-foreground truncate max-w-[130px] leading-tight">
              {user?.email || 'Admin'}
            </p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="w-3 h-3 text-primary" /> Root Admin
            </span>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg px-2 sm:px-3 h-9"
        >
          <LogOut className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>

      </div>
    </header>
  );
}
