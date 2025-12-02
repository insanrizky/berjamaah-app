'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getImageUrl } from '@/utils/image-url';
import { ClickableImage } from '@/components/shared/image-preview';
import { DonationDrawer } from '@/features/donation/donation-drawer';
import { formatCurrency } from '@/lib/currency-utils';
import { formatDateWIB } from '@/utils/dateFormat';
import { trpc } from '@/utils/trpc';
import {
  Target,
  Users,
  Calendar,
  Heart,
  TrendingUp,
  FileText,
  Banknote,
  User,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import Loader from '@/components/shared/loader';
import Link from 'next/link';

interface Program {
  id: string;
  title: string;
  description: string;
  target: number;
  collected: number;
  progress: number;
  period: string;
  category: string;
  donorCount: number;
  endDate: string;
  startDate?: string | null;
  status: string;
  bannerImage?: string | null;
  totalDonationCount?: number;
  totalRaisedAmount?: number;
  progressPercentage?: number;
  createdAt?: string | null;
}

export default function ProgramDetailPage() {
  const params = useParams();
  const programId = params.id as string;
  const [isDonationDrawerOpen, setIsDonationDrawerOpen] = useState(false);

  // Fetch program details
  const {
    data: programData,
    isLoading,
    error,
  } = trpc.program.getById.useQuery(
    { id: programId },
    { enabled: !!programId }
  );

  // Get program donations for transparency
  const { data: programDonations } = trpc.donation.getProgramDonations.useQuery(
    { programId, limit: 5 },
    { enabled: !!programId && !!programData }
  );

  const handleDonate = () => {
    setIsDonationDrawerOpen(true);
  };

  const handleCloseDonationDrawer = () => {
    setIsDonationDrawerOpen(false);
  };

  const handleDonationSubmit = (programId: string, amount: string) => {
    // Handle donation submission
    console.log('Donation submitted:', { programId, amount });
    // Optionally refresh the page data
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
    switch (category) {
      case 'Pendidikan':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Kesehatan':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Keagamaan':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Bencana':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader />
      </div>
    );
  }

  // Error state
  if (error || !programData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] px-4 text-center'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
          Program Tidak Ditemukan
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mb-6'>
          Program yang Anda cari tidak ditemukan atau mungkin telah dihapus.
        </p>
        <Link href='/programs'>
          <Button variant='outline'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Kembali ke Daftar Program
          </Button>
        </Link>
      </div>
    );
  }

  // Map API data to Program interface for DonationDrawer
  // Note: DonationDrawer expects a specific Program interface
  const programForDonation: Parameters<typeof DonationDrawer>[0]['program'] = {
    id: programData.id,
    title: programData.title,
    description: programData.description,
    target: Number(programData.targetAmount),
    collected: programData.totalRaisedAmount || 0,
    progress: programData.progressPercentage || 0,
    period: '-', // Period info not available from getById
    category: programData.category || 'Lainnya',
    startDate: null, // Period info not available from getById
    endDate: null, // Period info not available from getById
    totalRaisedAmount: programData.totalRaisedAmount,
    progressPercentage: programData.progressPercentage,
  };

  // Map API data to Program interface for display
  const program: Program = {
    id: programData.id,
    title: programData.title,
    description: programData.description,
    target: Number(programData.targetAmount),
    collected: programData.totalRaisedAmount || 0,
    progress: programData.progressPercentage || 0,
    period: '-', // Can be calculated if needed
    category: programData.category || 'Lainnya',
    donorCount: programData.totalDonationCount || 0,
    endDate: new Date().toISOString(), // Can be calculated if needed
    status: programData.status,
    bannerImage: programData.bannerImage,
    totalDonationCount: programData.totalDonationCount,
    totalRaisedAmount: programData.totalRaisedAmount,
    progressPercentage: programData.progressPercentage,
    createdAt: programData.createdAt,
  };

  const progress = program.progressPercentage || program.progress;
  const raisedAmount = program.totalRaisedAmount || program.collected;
  const donorCount = program.totalDonationCount || program.donorCount;

  return (
    <>
      <div className='space-y-6 px-4 pb-6'>
        {/* Back Button */}
        <Link href='/programs'>
          <Button variant='ghost' size='sm' className='-ml-2 my-4'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Kembali
          </Button>
        </Link>

        {/* Banner Image */}
        {program.bannerImage && (
          <div className='w-full overflow-hidden rounded-lg'>
            <ClickableImage
              src={getImageUrl(program.bannerImage)}
              alt={`Banner ${program.title}`}
              className='w-full h-auto max-h-[400px] object-contain'
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Program Header */}
        <div className='space-y-3'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            {program.title}
          </h1>
          <div className='flex items-center gap-2 mt-1'>
            <Badge
              variant='outline'
              className={`text-sm ${getCategoryColor(program.category)}`}
            >
              {program.category}
            </Badge>
            <Badge className={`text-sm ${getStatusColor(program.status)}`}>
              {{
                active: 'Aktif',
                inactive: 'Tidak Aktif',
                draft: 'Draft',
              }[program.status] || program.status}
            </Badge>
          </div>
        </div>

        {/* Program Description */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <FileText className='w-4 h-4' />
              Deskripsi Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap'>
              {program.description}
            </p>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <TrendingUp className='w-4 h-4' />
              Progress Penggalangan
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Progress
                </span>
                <span className='text-lg font-bold text-gray-900 dark:text-white'>
                  {progress.toFixed(1)}%
                </span>
              </div>
              <Progress value={progress} className='h-3' />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                <div className='flex items-center justify-center mb-1'>
                  <Target className='w-5 h-5 text-green-600 dark:text-green-400' />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Target
                </p>
                <p className='text-sm font-semibold text-green-600 dark:text-green-400'>
                  {formatCurrency(program.target)}
                </p>
              </div>
              <div className='text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <div className='flex items-center justify-center mb-1'>
                  <Banknote className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Terkumpul
                </p>
                <p className='text-sm font-semibold text-blue-600 dark:text-blue-400'>
                  {formatCurrency(raisedAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Users className='w-4 h-4' />
              Statistik Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
                <div className='flex items-center justify-center mb-1'>
                  <Users className='w-5 h-5 text-purple-600 dark:text-purple-400' />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Total Donatur
                </p>
                <p className='text-lg font-bold text-purple-600 dark:text-purple-400'>
                  {donorCount}
                </p>
              </div>
              <div className='text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg'>
                <div className='flex items-center justify-center mb-1'>
                  <Calendar className='w-5 h-5 text-orange-600 dark:text-orange-400' />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Mulai
                </p>
                <p className='text-sm font-semibold text-orange-600 dark:text-orange-400'>
                  {program.createdAt ? formatDateWIB(program.createdAt) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Donors */}
        {programDonations && programDonations.donations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Users className='w-4 h-4' />
                Donatur Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {programDonations.donations.map(donation => (
                  <div
                    key={donation.id}
                    className='flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
                        <User className='w-4 h-4 text-green-600 dark:text-green-400' />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {donation.donorName}
                        </p>
                        <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                          <Clock className='w-3 h-3' />
                          {formatDateWIB(donation.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold text-green-600 dark:text-green-400'>
                        {formatCurrency(donation.amount)}
                      </p>
                      <Badge className='text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'>
                        Terverifikasi
                      </Badge>
                    </div>
                  </div>
                ))}
                {programDonations.pagination.hasMore && (
                  <div className='text-center py-2'>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      Dan {programDonations.donations.length} donatur lainnya...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className='bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20'>
          <CardContent className='p-6 text-center space-y-4'>
            <div className='w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
              <Heart className='w-8 h-8 text-green-600 dark:text-green-400' />
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Mari Berdonasi
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Bantu program ini mencapai targetnya
              </p>
            </div>
            <Button onClick={handleDonate} className='w-full' size='lg'>
              <Heart className='w-5 h-5 mr-2' />
              Donasi Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Donation Drawer */}
      <DonationDrawer
        program={programForDonation}
        isOpen={isDonationDrawerOpen}
        onClose={handleCloseDonationDrawer}
        onSubmit={handleDonationSubmit}
      />
    </>
  );
}
