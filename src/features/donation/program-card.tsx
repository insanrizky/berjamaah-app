'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Eye, Heart, TrendingUp } from 'lucide-react';
import { DonationDrawer } from './donation-drawer';
import { UserProgramDetailDrawer } from './user-program-detail-drawer';
import { formatCurrencyCompact } from '@/lib/currency-utils';
import { getImageUrl } from '@/utils/image-url';
import { ClickableImage } from '@/components/shared/image-preview';

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

interface ProgramCardProps {
  program: Program;
  onDonationSubmit: (programId: string, amount: string) => void;
}

export function ProgramCard({ program, onDonationSubmit }: ProgramCardProps) {
  const [isDonationDrawerOpen, setIsDonationDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const handleDonate = () => {
    setIsDonationDrawerOpen(true);
  };

  const handleViewDetails = () => {
    setIsDetailDrawerOpen(true);
  };

  const handleDonationSubmit = (programId: string, amount: string) => {
    onDonationSubmit(programId, amount);
  };

  const handleCloseDonationDrawer = () => {
    setIsDonationDrawerOpen(false);
  };

  const handleCloseDetailDrawer = () => {
    setIsDetailDrawerOpen(false);
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

  const getCategoryColor = (category: string) => {
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

  const progress = program.progressPercentage || program.progress;
  const raisedAmount = program.totalRaisedAmount || program.collected;
  const donorCount = program.totalDonationCount || program.donorCount;

  return (
    <>
      <Card className='border-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden'>
        {/* Banner Image */}
        {program.bannerImage && (
          <div className='w-full overflow-hidden'>
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

        <CardContent className='p-4'>
          <div className='space-y-3'>
            {/* Header with Title and Status */}
            <div className='flex items-start justify-between'>
              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-gray-900 dark:text-white text-base leading-tight line-clamp-2'>
                  {program.title}
                </h3>
                <div className='flex items-center gap-2 mt-1'>
                  <Badge
                    variant='outline'
                    className={`text-xs ${getCategoryColor(program.category)}`}
                  >
                    {program.category}
                  </Badge>
                  <Badge
                    className={`text-xs ${getStatusColor(program.status)}`}
                  >
                    {{
                      active: 'Aktif',
                      inactive: 'Tidak Aktif',
                      draft: 'Draft',
                    }[program.status] || program.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className='space-y-1'>
              <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed'>
                {program.description}
              </p>
              {program.description.length > 100 && (
                <p className='text-xs text-gray-500 dark:text-gray-500 italic'>
                  Klik &quot;Detail&quot; untuk melihat deskripsi lengkap
                </p>
              )}
            </div>

            {/* Key Stats */}
            <div className='grid grid-cols-3 gap-3 text-center'>
              <div className='space-y-1'>
                <div className='flex items-center justify-center'>
                  <Target className='w-4 h-4 text-green-600 dark:text-green-400' />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Target
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {formatCurrencyCompact(program.target)}
                </p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center justify-center'>
                  <TrendingUp className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Terkumpul
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {formatCurrencyCompact(raisedAmount)}
                </p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center justify-center'>
                  <Users className='w-4 h-4 text-purple-600 dark:text-purple-400' />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Donatur
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {donorCount}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Progress
                </span>
                <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {progress.toFixed(1)}%
                </span>
              </div>
              <Progress value={progress} className='h-2' />
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleViewDetails}
                className='flex-1'
              >
                <Eye className='w-4 h-4 mr-1' />
                Detail
              </Button>
              <Button onClick={handleDonate} size='sm' className='flex-1'>
                <Heart className='w-4 h-4 mr-1' />
                Donasi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Drawer */}
      <DonationDrawer
        program={program}
        isOpen={isDonationDrawerOpen}
        onClose={handleCloseDonationDrawer}
        onSubmit={handleDonationSubmit}
      />

      {/* Program Detail Drawer */}
      <UserProgramDetailDrawer
        program={program}
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDetailDrawer}
      />
    </>
  );
}
