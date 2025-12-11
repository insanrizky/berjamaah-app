'use client';

import { useSession } from 'next-auth/react';
import BottomNavigationUser from '@/components/layout/bottom-navigation-user';
import { useCallback, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { trpcClient } from '@/utils/trpc';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { ListCard, ListCardContent } from '@/components/shared/list-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, X, Activity } from 'lucide-react';
import { formatDateWIB } from '@/utils/dateFormat';
import { ImagePreviewModal } from '@/components/shared/image-preview';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Report {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportResponse {
  reports: Report[];
  total: number;
  hasMore: boolean;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<{
    fileUrl: string;
    title: string;
  } | null>(null);

  const limit = 10;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ReportResponse>({
      queryKey: ['reports', 'public', limit],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        return await trpcClient.report.getAllPublic.query({
          page:
            Math.floor(
              (typeof pageParam === 'number' ? pageParam : 0) / limit
            ) + 1,
          limit,
        });
      },
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.hasMore) return undefined;
        const loaded = allPages.reduce(
          (sum, p) => sum + (p?.reports?.length ?? 0),
          0
        );
        return loaded;
      },
    });

  const reports: Report[] =
    data?.pages.flatMap(page => page?.reports ?? []) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && reports.length > 0) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, reports.length]);

  // Helper function to extract filename from URL
  const extractFileName = (url: string): string => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const fileName =
        decodedUrl.split('/').pop() || decodedUrl.split('\\').pop() || '';
      return fileName.split('?')[0];
    } catch {
      return url.split('/').pop() || url.split('\\').pop() || '';
    }
  };

  // Helper function to check if file is an image
  const isImageFile = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const fileName = extractFileName(url).toLowerCase();
    return imageExtensions.some(ext => fileName.endsWith(ext));
  };

  // Helper function to check if file is a PDF
  const isPdfFile = (url: string): boolean => {
    const fileName = extractFileName(url).toLowerCase();
    return fileName.endsWith('.pdf');
  };

  // Helper function to check if file can be previewed
  const canPreviewFile = (url: string): boolean => {
    return isImageFile(url) || isPdfFile(url);
  };

  const handlePreview = (report: { fileUrl: string; title: string }) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  return (
    <div className='bg-white dark:bg-gray-900'>
      <div
        className={`${session && status === 'authenticated' ? 'pb-20' : ''}`}
      >
        <div className='space-y-6 px-4 py-6'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Laporan
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Lihat laporan-laporan terbaru dari program donasi
            </p>
          </div>

          {/* Reports List */}
          <PullToRefresh
            onRefreshAction={async () => {
              // Refresh logic handled by React Query
            }}
          >
            <ListCard
              onLoadMore={reports.length > 0 ? handleLoadMore : undefined}
            >
              <ListCardContent className='px-0'>
                <div className='space-y-3'>
                  {reports.map(report => (
                    <Card
                      key={report.id}
                      className='py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 group'
                    >
                      <CardContent className='p-3'>
                        <div className='flex items-start gap-3'>
                          {/* Icon */}
                          <div className='flex-shrink-0 mt-0.5'>
                            <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200'>
                              <FileText className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                            </div>
                          </div>

                          {/* Main content */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between gap-2'>
                              <div className='flex-1 min-w-0'>
                                <h4 className='font-semibold text-gray-900 dark:text-white text-sm leading-tight'>
                                  {report.title}
                                </h4>
                                {report.description && (
                                  <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
                                    {report.description}
                                  </p>
                                )}
                                <div className='flex items-center gap-2 mt-2 flex-wrap'>
                                  {report.tags.slice(0, 3).map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant='secondary'
                                      className='text-xs px-2 py-0.5'
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {report.tags.length > 3 && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs px-2 py-0.5'
                                    >
                                      +{report.tags.length - 3}
                                    </Badge>
                                  )}
                                  <span className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1'>
                                    <Activity className='w-3 h-3' />
                                    {formatDateWIB(report.createdAt)}
                                  </span>
                                </div>
                              </div>
                              {canPreviewFile(report.fileUrl) && (
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    handlePreview({
                                      fileUrl: report.fileUrl,
                                      title: report.title,
                                    })
                                  }
                                  className='h-7 w-7 p-0 flex-shrink-0'
                                  title='Preview'
                                >
                                  <Eye className='w-4 h-4' />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {isLoading && (
                    <div className='text-center text-sm text-gray-500 py-4'>
                      Memuat laporan...
                    </div>
                  )}

                  {!isLoading && reports.length === 0 && (
                    <div className='text-center py-8'>
                      <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                      <p className='text-sm text-gray-500'>
                        Belum ada laporan yang tersedia
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
          </PullToRefresh>
        </div>
      </div>

      {/* Bottom Navigation - Only show if user is logged in */}
      {session && status === 'authenticated' && <BottomNavigationUser />}

      {/* Image Preview Modal */}
      {previewReport && isImageFile(previewReport.fileUrl) && (
        <ImagePreviewModal
          src={previewReport.fileUrl}
          alt={previewReport.title}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewReport(null);
          }}
        />
      )}

      {/* PDF Preview Modal */}
      {previewReport && isPdfFile(previewReport.fileUrl) && (
        <AlertDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <AlertDialogContent className='max-w-5xl max-h-[90vh] p-0 overflow-hidden'>
            <AlertDialogHeader className='p-4 pb-2'>
              <div className='flex items-center justify-between'>
                <AlertDialogTitle className='text-lg font-semibold'>
                  Preview PDF - {previewReport.title}
                </AlertDialogTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setIsPreviewOpen(false);
                    setPreviewReport(null);
                  }}
                  className='h-8 w-8 p-0'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </AlertDialogHeader>
            <div className='flex-1 overflow-auto p-4 pt-0'>
              <iframe
                src={previewReport.fileUrl}
                className='w-full h-[75vh] border border-gray-200 dark:border-gray-700 rounded-lg'
                title={extractFileName(previewReport.fileUrl)}
              />
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
