import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Admin',
  description: 'Dashboard administrasi untuk mengelola program, pengguna, dan donasi Berjamaah POSKU Bandung.',
};

export default function AdminHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
