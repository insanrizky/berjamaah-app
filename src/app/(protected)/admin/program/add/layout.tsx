import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tambah Program Baru',
  description: 'Buat program donasi atau kegiatan sosial baru untuk Berjamaah POSKU Bandung.',
};

export default function AddProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
