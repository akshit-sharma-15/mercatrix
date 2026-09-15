'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('SUPER_ADMIN' | 'VENDOR' | 'CUSTOMER')[];
  requireApproval?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, requireApproval }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        if (user.role === 'SUPER_ADMIN') router.push('/admin/dashboard');
        else if (user.role === 'VENDOR') router.push('/vendor/dashboard');
        else router.push('/');
        return;
      }

      if (requireApproval && user?.role === 'VENDOR' && !user.is_approved) {
        router.push('/vendor/pending-approval');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, requireApproval, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  if (requireApproval && user?.role === 'VENDOR' && !user.is_approved) {
    return null;
  }

  return <>{children}</>;
}
