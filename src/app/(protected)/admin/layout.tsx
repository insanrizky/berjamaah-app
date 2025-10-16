import type { Metadata } from 'next';
import BottomNavigationAdmin from '@/components/layout/bottom-navigation-admin';

export const metadata: Metadata = {
  title: {
    template: '%s - Admin - Berjamaah POSKU Bandung',
    default: 'Admin Dashboard - Berjamaah POSKU Bandung',
  },
  description: 'Panel administrasi Berjamaah POSKU Bandung untuk mengelola program, pengguna, dan donasi.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='pb-14 px-4'>{children}</div>
      <BottomNavigationAdmin />
    </>
  );
}
