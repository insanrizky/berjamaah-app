import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lupa Password',
  description:
    'Reset password akun Berjamaah POSKU Bandung untuk mendapatkan kembali akses ke platform.',
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
