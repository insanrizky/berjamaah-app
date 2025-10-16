'use client';

interface UsersHeaderProps {}

export function UsersHeader({}: UsersHeaderProps) {
  return (
    <div>
      <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
        Daftar Pengguna
      </h1>
      <p className='text-sm text-gray-600 dark:text-gray-400'>
        Kelola akun dan izin pengguna
      </p>
    </div>
  );
}
