import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Donasi - Admin',
  description: 'Verifikasi dan kelola donasi dari pengguna',
};

export default function DonationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
