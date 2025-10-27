'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { trpcClient } from '@/utils/trpc';
import {
  ListCard,
  ListCardContent,
  CardDataTitle,
  CardDataDescription,
  CardDataTimestamp,
} from '@/components/shared/list-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { formatCurrencyCompact } from '@/lib/currency-utils';
import { getImageUrl } from '@/utils/image-url';
import { ClickableImage } from '@/components/shared/image-preview';

// Types for program data
interface Program {
  id: string;
  title: string;
  description: string;
  targetAmount: string;
  category: string | null;
  status: string;
  contact?: string | null;
  details?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
  // _count removed - using totalDonationCount instead
  progressPercentage: number;
  totalRaisedAmount: number;
  totalDonationCount: number;
}

interface ProgramResponse {
  programs: Program[];
  hasMore: boolean;
}

interface ProgramListCardProps {
  status?: 'all' | 'draft' | 'active' | 'inactive';
  category?: string;
  onProgramSelect?: (programId: string) => void;
  className?: string;
}

export function ProgramListCard({
  status = 'all',
  category,
  onProgramSelect,
  className,
}: ProgramListCardProps) {
  const limit = 10;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ProgramResponse>({
      queryKey: ['programs', status, category, limit],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        return await trpcClient.program.getAll.query({
          status: status !== 'all' ? status : undefined,
          category: category !== 'all' ? category : undefined,
          limit,
          offset: typeof pageParam === 'number' ? pageParam : 0,
        });
      },
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.hasMore) return undefined;
        const loaded = allPages.reduce(
          (sum, p) => sum + (p?.programs?.length ?? 0),
          0
        );
        return loaded;
      },
    });

  // Get all programs from all pages
  const programs: Program[] =
    data?.pages.flatMap(page => page?.programs ?? []) ?? [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && programs.length > 0) {
      fetchNextPage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      case 'draft':
        return 'Draft';
      default:
        return 'Tidak Diketahui';
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyCompact(amount);
  };

  return (
    <div className={className}>
      <ListCard onLoadMore={programs.length > 0 ? handleLoadMore : undefined}>
        <ListCardContent className='px-0'>
          <div className='space-y-3'>
            {programs.map(program => (
              <Card
                key={program.id}
                className='py-0 gap-0 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden'
                onClick={() => onProgramSelect?.(program.id)}
              >
                {/* Header Image */}
                {program.bannerImage && (
                  <div className='w-full aspect-square overflow-hidden'>
                    <ClickableImage
                      src={getImageUrl(program.bannerImage)}
                      alt={`Banner ${program.title}`}
                      className='w-full h-full object-cover'
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <CardContent className='px-4 pt-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <CardDataTitle className='text-base font-semibold text-gray-900 dark:text-white truncate'>
                        {program.title}
                      </CardDataTitle>
                      <CardDataDescription className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1'>
                        {program.description}
                      </CardDataDescription>
                    </div>

                    <div className='flex flex-col items-end gap-2'>
                      <Badge
                        variant='secondary'
                        className={`text-xs px-2 py-1 ${getStatusColor(program.status)}`}
                      >
                        {getStatusText(program.status)}
                      </Badge>
                      <CardDataTimestamp>
                        {new Date(program.createdAt).toLocaleDateString(
                          'id-ID'
                        )}
                      </CardDataTimestamp>
                    </div>
                  </div>
                </CardContent>
                <CardContent className='px-4 pb-4'>
                  {/* Progress Bar */}
                  <div className='mt-3'>
                    <div className='flex justify-between text-xs mb-1'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Perkembangan
                      </span>
                      <span className='text-gray-900 dark:text-white font-medium'>
                        {program.progressPercentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5'>
                      <div
                        className='bg-green-600 h-1.5 rounded-full transition-all duration-300'
                        style={{
                          width: `${Math.min(100, program.progressPercentage || 0)}%`,
                        }}
                      />
                    </div>
                    <div className='flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1'>
                      <span>
                        Terkumpul: {formatCurrency(program.totalRaisedAmount)}
                      </span>
                      <span>
                        Target:{' '}
                        {formatCurrency(Number(program.targetAmount) || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {isLoading && (
              <div className='text-center text-sm text-gray-500 py-4'>
                Memuat program...
              </div>
            )}

            {!isLoading && programs.length === 0 && (
              <div className='text-center py-8'>
                <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-sm text-gray-500'>
                  Belum ada program yang ditemukan
                </p>
              </div>
            )}

            {isFetchingNextPage && (
              <div className='text-center text-sm text-gray-500 py-4'>
                Memuat lebih banyak...
              </div>
            )}
          </div>
        </ListCardContent>
      </ListCard>
    </div>
  );
}
