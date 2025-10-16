import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s - Berjamaah POSKU Bandung',
    default: 'Masuk - Berjamaah POSKU Bandung',
  },
  description: 'Sistem autentikasi Berjamaah POSKU Bandung untuk mengakses platform donasi dan kegiatan sosial.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
