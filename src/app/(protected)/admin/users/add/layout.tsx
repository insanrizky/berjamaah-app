import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tambah Pengguna Baru',
  description: 'Tambah pengguna baru ke sistem Berjamaah POSKU Bandung dengan hak akses yang sesuai.',
};

export default function AddUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
