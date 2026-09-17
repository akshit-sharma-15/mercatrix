import ClientLayout from './ClientLayout';

export const dynamic = 'force-dynamic';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
