'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Home,
  User,
  Menu,
  FolderKanban,
  CircleDollarSign,
  Users,
} from 'lucide-react';

export default function BottomNavigationAdmin() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const menuItems = [
    {
      href: '/admin/program',
      label: 'Program',
      icon: FolderKanban,
    },
    {
      href: '/admin/donations',
      label: 'Donasi',
      icon: CircleDollarSign,
    },
    {
      href: '/admin/users',
      label: 'Pengguna',
      icon: Users,
    },
  ];

  return (
    <div className='fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600'>
      <div className='grid h-full grid-cols-3 font-medium mx-auto max-w-lg px-0 sm:max-w-xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl'>
        {/* Home */}
        <Link
          href='/admin/home'
          className={`inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors ${
            isActive('/admin/home') ? 'bg-gray-50 dark:bg-gray-800' : ''
          }`}
        >
          <Home
            className={`w-5 h-5 mb-1 transition-colors ${
              isActive('/admin/home')
                ? 'text-green-600 dark:text-green-500'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-500'
            }`}
          />
          <span
            className={`text-xs transition-colors ${
              isActive('/admin/home')
                ? 'text-green-600 dark:text-green-500'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-500'
            }`}
          >
            Beranda
          </span>
        </Link>

        {/* More Menu */}
        <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DrawerTrigger asChild>
            <button
              className={`inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors ${
                menuItems.some(item => isActive(item.href))
                  ? 'bg-gray-50 dark:bg-gray-800'
                  : ''
              }`}
            >
              <Menu
                className={`w-5 h-5 mb-1 transition-colors ${
                  menuItems.some(item => isActive(item.href))
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-500'
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  menuItems.some(item => isActive(item.href))
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-500'
                }`}
              >
                Menu
              </span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className='mx-auto w-full max-w-md'>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
                <DrawerDescription>
                  Pilih menu yang ingin Anda akses
                </DrawerDescription>
              </DrawerHeader>
              <div className='px-4 pb-4 space-y-2'>
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <DrawerClose key={item.href} asChild>
                      <Link
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        href={item.href as any}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          active
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            active
                              ? 'text-green-600 dark:text-green-500'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        />
                        <span className='font-medium'>{item.label}</span>
                        {active && (
                          <div className='ml-auto w-2 h-2 rounded-full bg-green-600 dark:bg-green-500' />
                        )}
                      </Link>
                    </DrawerClose>
                  );
                })}
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Profile */}
        <Link
          href='/admin/profile'
          className={`inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors ${
            isActive('/admin/profile') ? 'bg-gray-50 dark:bg-gray-800' : ''
          }`}
        >
          <User
            className={`w-5 h-5 mb-1 transition-colors ${
              isActive('/admin/profile')
                ? 'text-green-600 dark:text-green-500'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-500'
            }`}
          />
          <span
            className={`text-xs transition-colors ${
              isActive('/admin/profile')
                ? 'text-green-600 dark:text-green-500'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-500'
            }`}
          >
            Profil
          </span>
        </Link>
      </div>
    </div>
  );
}
