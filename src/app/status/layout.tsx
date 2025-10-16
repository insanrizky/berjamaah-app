import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Status Sistem - Berjamaah POSKU Bandung',
  description: 'Monitor status dan kesehatan sistem Berjamaah POSKU Bandung secara real-time.',
};

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
