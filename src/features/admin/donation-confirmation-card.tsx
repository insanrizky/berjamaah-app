'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  CreditCard,
  Hash,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';
import { useCallback, useState } from 'react';
import { useTRPCClient } from '@/utils/trpc';
import { toast } from 'sonner';
import {
  AdminDonationDetailDrawer,
  AdminDonationDetail,
} from './donation-detail-drawer';

interface DonationConfirmationCardProps {
  donation: {
    id: string;
    donorName: string;
    donorEmail: string;
    donorPhone?: string | null;
    amount: number | string;
    paymentMethod?: string | null;
    donationReferenceNumber: string;
    donationProofImage?: string | null;
    status: string;
    createdAt: string | Date;
    program: {
      id: string;
      title: string;
      description: string;
      category?: string | null;
      bannerImage?: string | null;
    };
    programPeriod?: {
      id: string;
      startDate?: string | Date | null;
      endDate?: string | Date | null;
      cycleNumber?: number | null;
    } | null;
    verifiedByAdmin?: {
      id: string;
      fullName?: string | null;
      email: string;
    } | null;
    // Bank account fields (denormalized)
    bankName?: string | null;
    accountNumber?: string | null;
    accountHolder?: string | null;
  };
  onStatusChange?: () => void;
}

export function DonationConfirmationCard({
  donation,
  onStatusChange,
}: DonationConfirmationCardProps) {
  const trpcClient = useTRPCClient();
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleVerify = useCallback(async () => {
    try {
      setIsVerifying(true);
      await trpcClient.donation.verifyDonation.mutate({
        donationId: donation.id,
        action: 'verify',
      });

      toast.success('Donasi berhasil diverifikasi');
      onStatusChange?.();
    } catch (error) {
      console.error('Error verifying donation:', error);
      toast.error('Gagal memverifikasi donasi');
    } finally {
      setIsVerifying(false);
    }
  }, [donation.id, trpcClient, onStatusChange]);

  const handleReject = useCallback(async () => {
    try {
      setIsRejecting(true);
      await trpcClient.donation.verifyDonation.mutate({
        donationId: donation.id,
        action: 'reject',
      });

      toast.success('Donasi ditolak');
      onStatusChange?.();
    } catch (error) {
      console.error('Error rejecting donation:', error);
      toast.error('Gagal menolak donasi');
    } finally {
      setIsRejecting(false);
    }
  }, [donation.id, trpcClient, onStatusChange]);

  const handleVerifyFromDrawer = useCallback(
    async (donationId: string) => {
      try {
        setIsVerifying(true);
        await trpcClient.donation.verifyDonation.mutate({
          donationId,
          action: 'verify',
        });

        toast.success('Donasi berhasil diverifikasi');
        onStatusChange?.();
        setIsDetailDrawerOpen(false);
      } catch (error) {
        console.error('Error verifying donation:', error);
        toast.error('Gagal memverifikasi donasi');
      } finally {
        setIsVerifying(false);
      }
    },
    [trpcClient, onStatusChange]
  );

  const handleRejectFromDrawer = useCallback(
    async (donationId: string) => {
      try {
        setIsRejecting(true);
        await trpcClient.donation.verifyDonation.mutate({
          donationId,
          action: 'reject',
        });

        toast.success('Donasi ditolak');
        onStatusChange?.();
        setIsDetailDrawerOpen(false);
      } catch (error) {
        console.error('Error rejecting donation:', error);
        toast.error('Gagal menolak donasi');
      } finally {
        setIsRejecting(false);
      }
    },
    [trpcClient, onStatusChange]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant='outline'
            className='text-xs bg-yellow-50 text-yellow-700 border-yellow-200'
          >
            Menunggu Verifikasi
          </Badge>
        );
      case 'verified':
        return (
          <Badge
            variant='outline'
            className='text-xs bg-green-50 text-green-700 border-green-200'
          >
            Terverifikasi
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant='outline'
            className='text-xs bg-red-50 text-red-700 border-red-200'
          >
            Ditolak
          </Badge>
        );
      default:
        return (
          <Badge variant='outline' className='text-xs'>
            {status}
          </Badge>
        );
    }
  };

  const getPaymentMethodText = (method?: string | null) => {
    switch (method) {
      case 'bank_transfer':
        return 'Transfer Bank';
      case 'digital_wallet':
        return 'E-Wallet';
      case 'qris':
        return 'QRIS';
      default:
        return method || 'Tidak Diketahui';
    }
  };

  return (
    <>
      <Card className='border border-gray-200 dark:border-gray-700 py-0 hover:shadow-md transition-shadow cursor-pointer'>
        <CardContent
          className='p-4'
          onClick={() => setIsDetailDrawerOpen(true)}
        >
          <div className='space-y-4'>
            {/* Header with donor name and status */}
            <div className='flex items-start justify-between gap-3'>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <User className='w-4 h-4 text-gray-400' />
                  <h3 className='font-semibold text-gray-900 dark:text-white text-base truncate'>
                    {donation.donorName}
                  </h3>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400 truncate ml-6'>
                  {donation.program.title}
                </p>
              </div>
              {getStatusBadge(donation.status)}
            </div>

            {/* Amount - prominent display */}
            <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-3'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {formatCurrency(Number(donation.amount))}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                  Jumlah Donasi
                </div>
              </div>
            </div>

            {/* Key Information */}
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-gray-400' />
                <div>
                  <p className='text-gray-900 dark:text-white font-medium'>
                    {new Date(donation.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Tanggal
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <CreditCard className='w-4 h-4 text-gray-400' />
                <div>
                  <p className='text-gray-900 dark:text-white font-medium'>
                    {getPaymentMethodText(donation.paymentMethod)}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Metode
                  </p>
                </div>
              </div>
            </div>

            {/* Reference Number if available */}
            {donation.donationReferenceNumber && (
              <div className='flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2'>
                <Hash className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                <div>
                  <p className='text-blue-900 dark:text-blue-100 font-medium'>
                    {donation.donationReferenceNumber}
                  </p>
                  <p className='text-xs text-blue-600 dark:text-blue-400'>
                    Nomor Referensi
                  </p>
                </div>
              </div>
            )}

            {/* Bank Account Info if available */}
            {(donation.bankName || donation.accountNumber || donation.accountHolder) && (
              <div className='text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-2'>
                {donation.bankName && donation.accountNumber && (
                  <p className='text-gray-900 dark:text-white font-medium'>
                    {donation.bankName} - {donation.accountNumber}
                  </p>
                )}
                {donation.accountHolder && (
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    a.n. {donation.accountHolder}
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div
              className='flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700'
              onClick={e => e.stopPropagation()}
            >
              {donation.status === 'pending' && (
                <>
                  <Button
                    size='sm'
                    onClick={handleVerify}
                    disabled={isVerifying || isRejecting}
                    loading={isVerifying}
                    className='flex-1 text-xs h-8 bg-green-500 hover:bg-green-600'
                  >
                    <CheckCircle className='w-3 h-3 mr-1' />
                    Verifikasi
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleReject}
                    disabled={isVerifying || isRejecting}
                    loading={isRejecting}
                    variant='outline'
                    className='flex-1 text-xs h-8 border-red-200 text-red-700 hover:bg-red-50'
                  >
                    <XCircle className='w-3 h-3 mr-1' />
                    Tolak
                  </Button>
                </>
              )}

              {donation.status === 'verified' && (
                <div className='text-center text-sm text-gray-500 py-2'>
                  Donasi telah terverifikasi
                </div>
              )}
            </div>

            {/* Verification info if available */}
            {donation.verifiedByAdmin && (
              <div className='text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700'>
                <span className='text-green-600 dark:text-green-400'>✓</span>{' '}
                Diverifikasi oleh:{' '}
                {donation.verifiedByAdmin.fullName ||
                  donation.verifiedByAdmin.email}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Donation Detail Drawer */}
      <AdminDonationDetailDrawer
        donation={donation as AdminDonationDetail}
        isOpen={isDetailDrawerOpen}
        onCloseAction={() => setIsDetailDrawerOpen(false)}
        onVerify={handleVerifyFromDrawer}
        onReject={handleRejectFromDrawer}
        isVerifying={isVerifying}
        isRejecting={isRejecting}
      />
    </>
  );
}
