import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Riwayat Donasi',
  description: 'Lihat riwayat donasi Anda dan status verifikasi di Berjamaah POSKU Bandung.',
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
