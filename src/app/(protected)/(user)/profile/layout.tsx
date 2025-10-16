import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil Saya',
  description: 'Kelola profil dan informasi akun Berjamaah POSKU Bandung Anda.',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
