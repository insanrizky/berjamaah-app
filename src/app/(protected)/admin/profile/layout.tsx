import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil Admin',
  description: 'Kelola profil administrator Berjamaah POSKU Bandung.',
};

export default function AdminProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
