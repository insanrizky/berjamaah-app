'use client';

import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Shield,
  MessageCircle,
  Phone,
  CreditCard,
  Settings,
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import BankAccountDrawer from '@/components/bank-account/BankAccountDrawer';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isBankAccountDrawerOpen, setIsBankAccountDrawerOpen] = useState(false);
  const { data, isLoading } = trpc.user.getProfile.useQuery();

  if (status === 'loading') {
    return (
      <div className='bg-white dark:bg-gray-900'>
        <div className='space-y-6'>
          <Skeleton className='h-32 w-full' />
          <div className='space-y-4'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mock user data - replace with actual API call
  const userStats = {
    memberSince: '2024-01-15',
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className='space-y-6 px-4'>
      {/* Profile Header */}
      <Card className='border border-gray-200 dark:border-gray-700 shadow-sm py-0'>
        <CardContent className='p-6'>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
              <User className='w-8 h-8 text-green-600 dark:text-green-400' />
            </div>
            <div className='flex-1'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {isLoading ? 'Loading...' : data?.fullName}
              </h2>

              <Badge variant='outline' className='mt-1 text-xs'>
                <Shield className='w-3 h-3 mr-1' />
                {session?.user?.role || 'user'}
              </Badge>
            </div>
            {/* <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4" />
                </Button> */}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className='border border-gray-200 dark:border-gray-700 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base'>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-3'>
            <Mail className='w-5 h-5 text-gray-500 dark:text-gray-400' />
            <div>
              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                Email
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {session?.user?.email}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <Calendar className='w-5 h-5 text-gray-500 dark:text-gray-400' />
            <div>
              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                Bergabung Sejak
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {new Date(userStats.memberSince).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Management */}
      <Card className='border border-gray-200 dark:border-gray-700 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <CreditCard className='w-5 h-5 text-blue-600' />
            Rekening Bank
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300 mb-3'>
              Kelola rekening bank Anda untuk memudahkan proses donasi. Anda
              dapat menyimpan beberapa rekening dan mengatur salah satunya
              sebagai rekening utama.
            </p>
            <Button
              onClick={() => setIsBankAccountDrawerOpen(true)}
              className='w-full'
              variant='outline'
            >
              <Settings className='w-4 h-4 mr-2' />
              Kelola Rekening Bank
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pusat Bantuan */}
      <Card className='border border-gray-200 dark:border-gray-700 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <MessageCircle className='w-5 h-5 text-blue-600' />
            Pusat Bantuan
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300 mb-3'>
              Jika ada masalah atau pertanyaan, silakan hubungi admin kami
              melalui WhatsApp:
            </p>
            <div className='flex items-center gap-3'>
              <Phone className='w-5 h-5 text-green-600' />
              <a
                href='https://wa.me/6281221219646'
                target='_blank'
                rel='noopener noreferrer'
                className='text-green-600 hover:text-green-700 font-medium text-sm'
              >
                +62 812‑2121‑9646
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Menu */}
      <div className='space-y-3'>
        <Button
          variant='destructive'
          className='w-full'
          onClick={handleSignOut}
        >
          <LogOut className='w-5 h-5 mr-3' />
          Keluar
        </Button>
      </div>

      {/* Bank Account Drawer */}
      <BankAccountDrawer
        isOpen={isBankAccountDrawerOpen}
        onClose={() => setIsBankAccountDrawerOpen(false)}
      />
    </div>
  );
}
