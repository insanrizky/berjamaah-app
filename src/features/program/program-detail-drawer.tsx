/* eslint-disable @next/next/no-img-element */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/utils/trpc';
import Loader from '@/components/shared/loader';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Target,
  Users,
  Banknote,
  FileText,
  Phone,
  Tag,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface Program {
  id: string;
  title: string;
  description: string;
  targetAmount: string; // Changed from number to string to match database
  category: string | null;
  status: string; // Changed to string to match database return type
  programType: string; // Changed to string to match database return type
  contact?: string | null;
  details?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    fullName: string | null;
  } | null;
  programPeriods: Array<{
    id: string;
    startDate: string | null;
    endDate: string | null;
    currentAmount: string; // Changed from number to string to match database
    cycleNumber?: number | null;
    recurringFrequency?: string | null;
    recurringDay?: number | null;
    recurringDurationDays?: number | null;
    totalCycles?: number | null;
    nextActivationDate?: string | null;
  }>;
  // donations array is not included in getById query, only _count.donations
  _count: {
    donations: number;
  };
  totalRaisedAmount: number;
  totalDonationCount: number;
  progressPercentage: number;
}

interface ProgramDetailDrawerProps {
  programId: string;
  isOpen: boolean;
  onCloseAction: () => void;
  onDelete?: () => void;
}

export function ProgramDetailDrawer({
  programId,
  isOpen,
  onCloseAction,
  onDelete,
}: ProgramDetailDrawerProps) {
  const {
    data: program,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      return await trpcClient.program.getById.query({ id: programId });
    },
    enabled: isOpen && !!programId,
  });

  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: string) => {
      return await trpcClient.program.delete.mutate({ id: programId });
    },
    onSuccess: () => {
      toast.success('Program berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setIsDeleteDialogOpen(false);
      onCloseAction();
      onDelete?.();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus program');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      programId,
      status,
    }: {
      programId: string;
      status: string;
    }) => {
      return await trpcClient.program.updateProgramStatus.mutate({
        id: programId,
        status: status as 'draft' | 'pending' | 'active' | 'paused' | 'ended',
      });
    },
    onSuccess: () => {
      toast.success('Status program berhasil diperbarui');
      // Invalidate all relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      queryClient.invalidateQueries({ queryKey: ['programStats'] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui status program');
    },
  });

  const handleDeleteProgram = () => {
    if (program) {
      deleteProgramMutation.mutate(program.id);
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (program) {
      updateStatusMutation.mutate({ programId: program.id, status: newStatus });
    }
  };

  const getAvailableStatusActions = (currentStatus: string) => {
    const statusActions: Record<
      string,
      Array<{ status: string; label: string; variant: string }>
    > = {
      draft: [
        { status: 'pending', label: 'Ajukan untuk Review', variant: 'default' },
        { status: 'active', label: 'Aktifkan', variant: 'default' },
      ],
      pending: [
        { status: 'active', label: 'Aktifkan', variant: 'default' },
        { status: 'draft', label: 'Kembali ke Draft', variant: 'outline' },
      ],
      active: [
        { status: 'paused', label: 'Jeda Program', variant: 'outline' },
        { status: 'ended', label: 'Akhiri Program', variant: 'destructive' },
      ],
      paused: [
        { status: 'active', label: 'Lanjutkan Program', variant: 'default' },
        { status: 'ended', label: 'Akhiri Program', variant: 'destructive' },
      ],
      ended: [{ status: 'active', label: 'Buka Kembali', variant: 'default' }],
    };

    return statusActions[currentStatus] || [];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ended':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'ended':
        return 'Selesai';
      case 'paused':
        return 'Dijeda';
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Menunggu';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getCreatorDisplayName = (program: Program) => {
    if (!program.createdByUser) return 'Tidak diketahui';

    const { fullName } = program.createdByUser;

    return fullName || 'Tidak diketahui';
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-500'>Error loading program: {error.message}</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500'>Program not found</p>
      </div>
    );
  }

  // Get the latest period for date information
  const latestPeriod = program.programPeriods[0];

  const displayPeriodDate = (date: string | null) => {
    if (date !== '1970-01-01T00:00:00.000Z' && date !== null)
      return formatDateTime(date);
    return '~';
  };

  const getDateAlertInfo = (
    startDate: string | null,
    endDate: string | null
  ) => {
    const isStartEmpty = !startDate || startDate === '1970-01-01T00:00:00.000Z';
    const isEndEmpty = !endDate || endDate === '1970-01-01T00:00:00.000Z';

    if (isStartEmpty && isEndEmpty) {
      return {
        type: 'warning' as const,
        message:
          '⚠️ Tanggal mulai dan selesai belum ditentukan. Program dapat berjalan tanpa batas waktu.',
      };
    } else if (isStartEmpty) {
      return {
        type: 'info' as const,
        message:
          'ℹ️ Tanggal mulai belum ditentukan. Program akan dimulai kapan saja.',
      };
    } else if (isEndEmpty) {
      return {
        type: 'info' as const,
        message:
          'ℹ️ Tanggal selesai belum ditentukan. Program akan berjalan tanpa batas waktu.',
      };
    } else {
      return {
        type: 'success' as const,
        message:
          '✅ Program memiliki jadwal yang jelas dengan tanggal mulai dan selesai.',
      };
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header with Title and Status */}
      <div className='text-center space-y-3'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
          {program.title}
        </h2>
        <Badge
          variant='secondary'
          className={`text-sm px-3 py-1 ${getStatusColor(program.status)}`}
        >
          {getStatusText(program.status)}
        </Badge>
      </div>

      {/* Banner Image */}
      {program.bannerImage && (
        <div className='w-full'>
          <img
            src={program.bannerImage}
            alt={`Banner ${program.title}`}
            className='w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700'
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Program Information Section */}
      <Card className='gap-0'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <FileText className='w-4 h-4' />
            Informasi Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <Tag className='w-5 h-5 text-gray-400' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  {program.category || 'Tidak ada kategori'}
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Kategori
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <FileText className='w-5 h-5 text-gray-400 mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Deskripsi
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {program.description}
                </p>
              </div>
            </div>

            {program.details && (
              <div className='flex items-start gap-3'>
                <FileText className='w-5 h-5 text-gray-400 mt-0.5' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                    Detail Program
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {program.details}
                  </p>
                </div>
              </div>
            )}

            {program.contact && (
              <div className='flex items-center gap-3'>
                <Phone className='w-5 h-5 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {program.contact}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Kontak
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress & Funding Section */}
      <Card className='gap-0'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <Target className='w-4 h-4' />
            Progress & Pendanaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className='space-y-2 mb-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600 dark:text-gray-400'>
                Perkembangan
              </span>
              <span className='text-gray-900 dark:text-white font-medium'>
                {program.progressPercentage?.toFixed(1)}%
              </span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
              <div
                className='bg-green-600 h-3 rounded-full transition-all duration-300'
                style={{
                  width: `${Math.min(program.progressPercentage || 0, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <Banknote className='w-5 h-5 text-gray-400' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  {formatCurrency(program.totalRaisedAmount)}
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Dana Terkumpul
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Target className='w-5 h-5 text-gray-400' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  {formatCurrency(Number(program.targetAmount))}
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Target Dana
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Users className='w-5 h-5 text-gray-400' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  {program._count.donations} orang
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Total Donatur
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Status Section */}
      {latestPeriod && (
        <Card className='gap-0'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              Jadwal Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <Calendar className='w-5 h-5 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {displayPeriodDate(latestPeriod.startDate)}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Tanggal Mulai
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Calendar className='w-5 h-5 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {displayPeriodDate(latestPeriod.endDate)}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Tanggal Selesai
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <TrendingUp className='w-5 h-5 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {getCreatorDisplayName(program)}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Dibuat oleh • {formatDateTime(program.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Alert */}
            <Alert
              className={`mt-4 ${
                getDateAlertInfo(latestPeriod.startDate, latestPeriod.endDate)
                  .type === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                  : getDateAlertInfo(
                        latestPeriod.startDate,
                        latestPeriod.endDate
                      ).type === 'info'
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                    : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              }`}
            >
              <AlertDescription className='text-sm'>
                {
                  getDateAlertInfo(latestPeriod.startDate, latestPeriod.endDate)
                    .message
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions - Only show if user is the creator */}
      {session?.user?.id === program?.createdBy && (
        <Card className='gap-0'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Shield className='w-4 h-4' />
              Kelola Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Status Actions */}
            {getAvailableStatusActions(program.status).length > 0 && (
              <div className='space-y-2 mb-4'>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  Ubah Status Program
                </p>
                {getAvailableStatusActions(program.status).map(action => (
                  <Button
                    key={action.status}
                    variant={
                      action.variant as 'default' | 'outline' | 'destructive'
                    }
                    size='sm'
                    className='w-full'
                    onClick={() => handleUpdateStatus(action.status)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <div className='w-4 h-4 mr-2'>
                          <Loader />
                        </div>
                        Memproses...
                      </>
                    ) : (
                      action.label
                    )}
                  </Button>
                ))}
              </div>
            )}

            {/* Delete Action */}
            <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                Zona Bahaya
              </p>
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant='destructive'
                    size='sm'
                    className='w-full'
                    disabled={deleteProgramMutation.isPending}
                  >
                    {deleteProgramMutation.isPending ? (
                      <>
                        <div className='w-4 h-4 mr-2'>
                          <Loader />
                        </div>
                        Menghapus...
                      </>
                    ) : (
                      'Hapus Program'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Program</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus program &quot;
                      {program?.title}&quot;? Tindakan ini tidak dapat
                      dibatalkan dan akan menghapus semua data program termasuk
                      periode dan donasi yang terkait.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProgram}
                      className='bg-red-600 hover:bg-red-700'
                      disabled={deleteProgramMutation.isPending}
                    >
                      {deleteProgramMutation.isPending
                        ? 'Menghapus...'
                        : 'Hapus'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
