import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selesaikan Pendaftaran',
  description: 'Lengkapi data pendaftaran akun Berjamaah POSKU Bandung untuk mengakses semua fitur platform.',
};

export default function CompleteRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
