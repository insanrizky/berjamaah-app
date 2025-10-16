import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Pengguna',
  description: 'Kelola pengguna dan hak akses dalam sistem Berjamaah POSKU Bandung.',
};

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
