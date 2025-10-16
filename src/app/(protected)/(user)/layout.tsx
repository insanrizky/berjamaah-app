import type { Metadata } from 'next';
import BottomNavigationUser from '@/components/layout/bottom-navigation-user';

export const metadata: Metadata = {
  title: {
    template: '%s - Berjamaah POSKU Bandung',
    default: 'Dashboard - Berjamaah POSKU Bandung',
  },
  description:
    'Dashboard pengguna Berjamaah POSKU Bandung untuk mengelola donasi dan profil.',
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=''>
      <div className='pb-14'>{children}</div>
      <BottomNavigationUser />
    </div>
  );
}
