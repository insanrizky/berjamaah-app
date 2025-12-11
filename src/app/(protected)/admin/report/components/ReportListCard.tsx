'use client';

import { useState, useCallback } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertCircle,
  FileText,
  MoreHorizontal,
  Trash2,
  Edit,
  Download,
  Calendar,
  Eye,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Report } from '../types';
import { ImagePreviewModal } from '@/components/shared/image-preview';

interface ReportResponse {
  reports: Report[];
  total: number;
  hasMore: boolean;
}

interface ReportListCardProps {
  search?: string;
  tags?: string[];
  className?: string;
}

export function ReportListCard({
  search,
  tags,
  className,
}: ReportListCardProps) {
  const router = useRouter();
  const limit = 10;
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ReportResponse>({
      queryKey: ['reports', search, tags, limit],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        return await trpcClient.report.getAll.query({
          page:
            Math.floor(
              (typeof pageParam === 'number' ? pageParam : 0) / limit
            ) + 1,
          limit,
          search: search || undefined,
          tags: tags && tags.length > 0 ? tags : undefined,
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

  const handleDelete = async (report: Report) => {
    try {
      setIsDeleting(true);
      await trpcClient.report.delete.mutate({ id: report.id });
      toast.success('Laporan berhasil dihapus');
      setShowDeleteDialog(false);
      setSelectedReport(null);
      // Invalidate queries to refresh data
      window.location.reload();
    } catch {
      toast.error('Gagal menghapus laporan');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (report: Report) => {
    setSelectedReport(report);
    setShowDeleteDialog(true);
  };

  const handleReportSelect = (report: Report) => {
    setSelectedReportId(report.id);
    setSelectedReport(report);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedReportId(null);
    setSelectedReport(null);
  };

  const handleEdit = (report: Report) => {
    router.push(`/admin/report/edit/${report.id}`);
  };

  const handleDownload = (report: Report) => {
    window.open(report.fileUrl, '_blank');
  };

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

  const handlePreview = (report: Report) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={className}>
      <ListCard onLoadMore={reports.length > 0 ? handleLoadMore : undefined}>
        <ListCardContent className='px-0'>
          <div className='space-y-3'>
            {reports.map(report => (
              <Card
                key={report.id}
                className='py-0 gap-0 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer'
                onClick={() => handleReportSelect(report)}
              >
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <FileText className='w-4 h-4 text-gray-400' />
                        <CardDataTitle className='text-base font-semibold text-gray-900 dark:text-white truncate'>
                          {report.title}
                        </CardDataTitle>
                      </div>
                      {report.description && (
                        <CardDataDescription className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1'>
                          {report.description}
                        </CardDataDescription>
                      )}
                      {report.tags.length > 0 && (
                        <div className='flex flex-wrap gap-1 mt-2'>
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
                        </div>
                      )}
                    </div>

                    <div className='flex flex-col items-end gap-2'>
                      <div className='flex items-center gap-1'>
                        {canPreviewFile(report.fileUrl) && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={e => {
                              e.stopPropagation();
                              handlePreview(report);
                            }}
                            className='h-8 w-8 p-0'
                            title='Preview'
                          >
                            <Eye className='w-4 h-4' />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={e => e.stopPropagation()}
                              className='h-8 w-8 p-0'
                            >
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleEdit(report);
                              }}
                            >
                              <Edit className='w-4 h-4 mr-2' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleDownload(report);
                              }}
                            >
                              <Download className='w-4 h-4 mr-2' />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                openDeleteDialog(report);
                              }}
                              className='text-red-600 dark:text-red-400'
                            >
                              <Trash2 className='w-4 h-4 mr-2' />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDataTimestamp>
                        {formatDate(report.createdAt)}
                      </CardDataTimestamp>
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
                <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-sm text-gray-500'>
                  Belum ada laporan yang ditemukan
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus laporan{' '}
              <strong>{selectedReport?.title}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedReport && handleDelete(selectedReport)}
              disabled={isDeleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Detail Drawer */}
      {selectedReportId && selectedReport && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
              <DrawerHeader className='flex-shrink-0'>
                <DrawerTitle>Detail Laporan</DrawerTitle>
                <DrawerDescription>
                  Informasi lengkap tentang laporan ini
                </DrawerDescription>
              </DrawerHeader>
              <div className='flex-1 px-4 pb-4'>
                <div className='space-y-6'>
                  {/* Report Info Section */}
                  <Card className='gap-0'>
                    <CardContent className='pt-6'>
                      <div className='space-y-3'>
                        <div>
                          <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                            {selectedReport.title}
                          </p>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>
                            Judul
                          </p>
                        </div>
                        {selectedReport.description && (
                          <div>
                            <p className='text-sm text-gray-900 dark:text-white mb-1'>
                              {selectedReport.description}
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Deskripsi
                            </p>
                          </div>
                        )}
                        {selectedReport.tags.length > 0 && (
                          <div>
                            <div className='flex flex-wrap gap-2 mb-1'>
                              {selectedReport.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant='secondary'
                                  className='text-xs'
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Tag
                            </p>
                          </div>
                        )}
                        <div className='flex items-center gap-3'>
                          <Calendar className='w-5 h-5 text-gray-400' />
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                              {formatDate(selectedReport.createdAt)}
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Tanggal Dibuat
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions Section */}
                  <Card className='gap-0'>
                    <CardContent className='pt-6'>
                      <div className='space-y-2'>
                        {canPreviewFile(selectedReport.fileUrl) && (
                          <Button
                            onClick={() => handlePreview(selectedReport)}
                            variant='outline'
                            className='w-full'
                          >
                            <Eye className='w-4 h-4 mr-2' />
                            Preview File
                          </Button>
                        )}
                        <Button
                          onClick={() => handleEdit(selectedReport)}
                          className='w-full'
                        >
                          <Edit className='w-4 h-4 mr-2' />
                          Edit Laporan
                        </Button>
                        <Button
                          onClick={() => handleDownload(selectedReport)}
                          variant='outline'
                          className='w-full'
                        >
                          <Download className='w-4 h-4 mr-2' />
                          Download File
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(selectedReport)}
                          variant='outline'
                          className='w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        >
                          <Trash2 className='w-4 h-4 mr-2' />
                          Hapus Laporan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <DrawerFooter className='flex-shrink-0'>
                <DrawerClose asChild>
                  <Button variant='outline' onClick={handleDrawerClose}>
                    Tutup
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}

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
