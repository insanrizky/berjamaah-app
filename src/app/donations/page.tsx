'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Heart,
  Target,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/utils/trpc';
import { formatCurrency } from '@/lib/currency-utils';
import { formatDateWIB } from '@/utils/dateFormat';
import { getImageUrl } from '@/utils/image-url';
import { ClickableImage } from '@/components/shared/image-preview';

export default function DonationsPage() {
  const { data: donations, isLoading } =
    trpc.donation.getUserDonations.useQuery({
      limit: 50,
      status: 'verified',
    });

  console.log({ donations });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Terverifikasi';
      case 'pending':
        return 'Menunggu Verifikasi';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
        <div className='container mx-auto px-4 py-8'>
          <div className='space-y-4'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
            <div className='space-y-3'>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className='h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center gap-3 mb-2'>
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='p-2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              <Link href='/' title='Kembali ke beranda'>
                <ArrowLeft className='w-4 h-4' />
              </Link>
            </Button>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Riwayat Donasi
            </h1>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400 ml-11'>
            Semua donasi yang telah Anda berikan
          </p>
        </div>

        {/* Donations List */}
        {donations &&
        donations.donations.filter(d => d.status === 'verified').length > 0 ? (
          <div className='space-y-4'>
            {donations.donations
              .filter(donation => donation.status === 'verified')
              .map(donation => (
                <Card
                  key={donation.id}
                  className='py-2 border-0 bg-white dark:bg-gray-800 shadow-sm'
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-4'>
                      {/* Program Image */}
                      {donation.program.bannerImage && (
                        <div className='w-16 h-16 rounded-lg overflow-hidden flex-shrink-0'>
                          <ClickableImage
                            src={getImageUrl(donation.program.bannerImage)}
                            alt={donation.program.title}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      )}

                      {/* Donation Details */}
                      <div className='flex-1 min-w-0'>
                        {/* Header with title and status */}
                        <div className='flex items-start justify-between mb-3'>
                          <div className='flex-1 min-w-0'>
                            <h3 className='font-semibold text-gray-900 dark:text-white text-sm line-clamp-1'>
                              {donation.program.title}
                            </h3>
                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                              {donation.program.category}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs px-2 py-1 ${getStatusColor(donation.status)}`}
                          >
                            {getStatusText(donation.status)}
                          </Badge>
                        </div>

                        {/* Main info row - amount and date */}
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex items-center gap-2'>
                            <Heart className='w-4 h-4 text-red-500' />
                            <span className='font-bold text-lg text-gray-900 dark:text-white'>
                              {formatCurrency(donation.amount)}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                            <Calendar className='w-3 h-3' />
                            <span className='text-xs'>
                              {formatDateWIB(donation.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Donor info */}
                        <div className='flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700'>
                          <div className='flex items-center gap-2'>
                            <User className='w-3 h-3 text-gray-500 dark:text-gray-400' />
                            <span className='text-xs text-gray-600 dark:text-gray-300'>
                              {donation.donorName || 'Donatur Anonim'}
                            </span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <CheckCircle className='w-3 h-3 text-green-500' />
                            <span className='text-xs text-green-600 dark:text-green-400 font-medium'>
                              Terverifikasi
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card className='border-0 bg-white dark:bg-gray-800 shadow-sm'>
            <CardContent className='p-8 text-center'>
              <div className='w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4'>
                <Heart className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Belum Ada Donasi Terverifikasi
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Belum ada donasi yang berstatus terverifikasi. Mulai berdonasi
                untuk membantu program yang membutuhkan.
              </p>
              <Button asChild>
                <Link href='/programs'>
                  <Target className='w-4 h-4 mr-2' />
                  Lihat Program
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
