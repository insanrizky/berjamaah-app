'use client';

import { Heart, Shield } from 'lucide-react';
import UserMenu from './user-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <header className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-50'>
      <div className='mx-auto max-w-sm px-4 py-3 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg'>
        <div className='flex items-center justify-between'>
          {/* Left side - User and Admin Links */}
          <div className='flex items-center gap-4'>
            {/* User Link */}
            {!isAdminRoute && (
              <Link href='/'>
                <div className='flex items-center gap-2 cursor-pointer'>
                  <div className='w-6 h-6 rounded-full flex items-center justify-center bg-green-500'>
                    <Heart className='w-4 h-4 text-white fill-white' />
                  </div>
                  <span className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Berjamaah POSKU Bandung
                  </span>
                </div>
              </Link>
            )}

            {/* Admin Link */}
            {isAdminRoute && (
              <Link href='/admin/home'>
                <div className='flex items-center gap-2 cursor-pointer'>
                  <div className='w-6 h-6 rounded-full flex items-center justify-center bg-blue-500'>
                    <Shield className='w-4 h-4 text-white fill-white' />
                  </div>
                  <span className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Admin Portal
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Right side - User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
