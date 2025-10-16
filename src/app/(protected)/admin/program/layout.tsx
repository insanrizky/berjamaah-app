import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Program',
  description: 'Kelola program donasi dan kegiatan sosial Berjamaah POSKU Bandung.',
};

export default function AdminProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
