'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency-utils';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DonationHistoryItem {
  id: string;
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  donationReferenceNumber: string;
  createdAt: string;
  program: {
    id: string;
    title: string;
    category: string | null;
    bannerImage: string | null;
  };
  programPeriod: {
    id: string;
    startDate: string;
    endDate: string;
    cycleNumber: number | null;
  };
}

interface DonationHistoryCardProps {
  donation: DonationHistoryItem;
  onViewDetails?: (donationId: string) => void;
}

export function DonationHistoryCard({
  donation,
  onViewDetails,
}: DonationHistoryCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          color:
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
          text: 'Terverifikasi',
          icon: CheckCircle,
        };
      case 'pending':
        return {
          color:
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
          text: 'Menunggu',
          icon: Clock,
        };
      case 'rejected':
        return {
          color:
            'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
          text: 'Ditolak',
          icon: XCircle,
        };
      default:
        return {
          color:
            'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800',
          text: status,
          icon: AlertCircle,
        };
    }
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hari ini';
    } else if (diffInDays === 1) {
      return 'Kemarin';
    } else if (diffInDays < 7) {
      return `${diffInDays} hari lalu`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} minggu lalu`;
    } else {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category)
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

    const colors: Record<string, string> = {
      kesehatan:
        'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      pendidikan:
        'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      sosial:
        'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
      bencana: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
      infrastruktur:
        'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    };

    return (
      colors[category.toLowerCase()] ||
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    );
  };

  const statusConfig = getStatusConfig(donation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={cn(
        'group py-2 border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-200',
        onViewDetails && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
      )}
      onClick={() => onViewDetails?.(donation.id)}
    >
      <CardContent className='p-0'>
        <div className='flex gap-3 p-3'>
          {/* Program Image */}
          <div className='flex-shrink-0'>
            {donation.program.bannerImage ? (
              <div className='w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800'>
                <img
                  src={donation.program.bannerImage}
                  alt={donation.program.title}
                  className='w-full h-full object-cover'
                />
              </div>
            ) : (
              <div className='w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center'>
                <ImageIcon className='w-5 h-5 text-blue-500 dark:text-blue-400' />
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0 space-y-1.5'>
            {/* Header Row */}
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2'>
                  {donation.program.title}
                </h3>
                {donation.program.category && (
                  <Badge
                    variant='secondary'
                    className={cn(
                      'text-xs px-2 py-0.5 mt-1',
                      getCategoryColor(donation.program.category)
                    )}
                  >
                    {donation.program.category}
                  </Badge>
                )}
              </div>

              <div className='flex flex-col items-end gap-1'>
                <span className='font-bold text-emerald-600 dark:text-emerald-400 text-sm'>
                  {formatCurrency(donation.amount)}
                </span>
                <Badge
                  variant='outline'
                  className={cn(
                    'text-xs px-2 py-1 flex items-center gap-1',
                    statusConfig.color
                  )}
                >
                  <StatusIcon className='w-3 h-3' />
                  {statusConfig.text}
                </Badge>
              </div>
            </div>

            {/* Footer Row */}
            <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
              <div className='flex items-center gap-1'>
                <Calendar className='w-3 h-3' />
                <span>{formatRelativeDate(donation.createdAt)}</span>
              </div>
              <div className='text-right'>
                <span className='font-mono text-xs'>
                  #{donation.donationReferenceNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
