/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { formatCurrency } from '@/lib/currency-utils';
import {
  CheckCircle,
  Clock,
  XCircle,
  Target,
  User,
  Mail,
  Phone,
  Building2,
  Image as ImageIcon,
  Eye,
  Calendar,
  CreditCard,
  Hash,
  Shield,
} from 'lucide-react';

export interface AdminDonationDetail {
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
  verifiedAt?: string | Date | null;
  program: {
    id: string;
    title: string;
    description: string;
    category?: string | null;
    bannerImage?: string | null;
    targetAmount: number | string;
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
  userBankAccount?: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  } | null;
}

interface AdminDonationDetailDrawerProps {
  donation: AdminDonationDetail | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onVerify?: (donationId: string) => void;
  onReject?: (donationId: string) => void;
  onConfirm?: (donationId: string) => void;
  isVerifying?: boolean;
  isRejecting?: boolean;
  isConfirming?: boolean;
}

export function AdminDonationDetailDrawer({
  donation,
  isOpen,
  onCloseAction,
  onVerify,
  onReject,
  onConfirm,
  isVerifying = false,
  isRejecting = false,
  isConfirming = false,
}: AdminDonationDetailDrawerProps) {
  const [imageError, setImageError] = useState(false);

  if (!donation) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-700 border-yellow-200'
          >
            <Clock className='w-3 h-3 mr-1' />
            Menunggu Verifikasi
          </Badge>
        );
      case 'verified':
        return (
          <Badge
            variant='outline'
            className='bg-blue-50 text-blue-700 border-blue-200'
          >
            <CheckCircle className='w-3 h-3 mr-1' />
            Terverifikasi
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-200'
          >
            <CheckCircle className='w-3 h-3 mr-1' />
            Terkonfirmasi
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant='outline'
            className='bg-red-50 text-red-700 border-red-200'
          >
            <XCircle className='w-3 h-3 mr-1' />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={onCloseAction}>
      <DrawerContent className='max-h-[85vh] flex flex-col'>
        <div className='max-w-2xl mx-auto w-full px-4 flex-1 flex flex-col min-h-0'>
          <DrawerHeader className='pb-4 flex-shrink-0'>
            <div className=''>
              <div className='mb-4'>
                <DrawerTitle className='text-lg font-semibold'>
                  Detail Donasi
                </DrawerTitle>
                <DrawerDescription>
                  Informasi lengkap donasi dari {donation.donorName}
                </DrawerDescription>
              </div>
              {getStatusBadge(donation.status)}
            </div>
          </DrawerHeader>

          <div className='space-y-6 overflow-y-auto flex-1 min-h-0 pr-2'>
            {/* Donor Information */}
            <Card className='gap-0'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <User className='w-4 h-4' />
                  Informasi Donatur
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-1 gap-3'>
                  <div className='flex items-center gap-3'>
                    <User className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {donation.donorName}
                      </p>
                      <p className='text-xs text-gray-500'>Nama Donatur</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Mail className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {donation.donorEmail}
                      </p>
                      <p className='text-xs text-gray-500'>Email</p>
                    </div>
                  </div>

                  {donation.donorPhone && (
                    <div className='flex items-center gap-3'>
                      <Phone className='w-4 h-4 text-gray-500' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {donation.donorPhone}
                        </p>
                        <p className='text-xs text-gray-500'>Nomor Telepon</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Donation Information */}
            <Card className='gap-0'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <Target className='w-4 h-4' />
                  Informasi Donasi
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-1 gap-3'>
                  <div className='flex items-center gap-3'>
                    <Hash className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {donation.donationReferenceNumber}
                      </p>
                      <p className='text-xs text-gray-500'>Nomor Referensi</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <CreditCard className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {formatCurrency(Number(donation.amount))}
                      </p>
                      <p className='text-xs text-gray-500'>Jumlah Donasi</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Building2 className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {getPaymentMethodText(donation.paymentMethod)}
                      </p>
                      <p className='text-xs text-gray-500'>Metode Pembayaran</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Calendar className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {formatDate(donation.createdAt)}
                      </p>
                      <p className='text-xs text-gray-500'>Tanggal Donasi</p>
                    </div>
                  </div>

                  {donation.verifiedAt && (
                    <div className='flex items-center gap-3'>
                      <Shield className='w-4 h-4 text-gray-500' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {formatDate(donation.verifiedAt)}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Tanggal Verifikasi
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {donation.userBankAccount && (
                  <div className='pt-3 border-t border-gray-100'>
                    <p className='text-xs text-gray-500 mb-2 font-medium'>
                      Rekening Pengirim
                    </p>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-3'>
                        <Building2 className='w-4 h-4 text-gray-500' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {donation.userBankAccount.bankName}
                          </p>
                          <p className='text-xs text-gray-500'>Nama Bank</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <CreditCard className='w-4 h-4 text-gray-500' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {donation.userBankAccount.accountNumber}
                          </p>
                          <p className='text-xs text-gray-500'>
                            Nomor Rekening
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <User className='w-4 h-4 text-gray-500' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {donation.userBankAccount.accountHolder}
                          </p>
                          <p className='text-xs text-gray-500'>
                            Nama Pemilik Rekening
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Information */}
            <Card className='gap-0'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <Target className='w-4 h-4' />
                  Program Donasi
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-1'>
                    {donation.program.title}
                  </h4>
                  <p className='text-sm text-gray-600 mb-2'>
                    {donation.program.description}
                  </p>
                  {donation.program.category && (
                    <Badge variant='outline' className='text-xs'>
                      {donation.program.category}
                    </Badge>
                  )}
                </div>

                {donation.programPeriod && (
                  <div className='pt-3 border-t border-gray-100'>
                    <p className='text-sm font-medium text-gray-900 mb-1'>
                      Periode Program
                    </p>
                    <p className='text-sm text-gray-600'>
                      Siklus #{donation.programPeriod.cycleNumber} -{' '}
                      {donation.programPeriod.startDate &&
                      donation.programPeriod.endDate
                        ? `${formatDate(donation.programPeriod.startDate)} - ${formatDate(donation.programPeriod.endDate)}`
                        : 'Periode aktif'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Proof */}
            {donation.donationProofImage && (
              <Card className='gap-0'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <ImageIcon className='w-4 h-4' />
                    Bukti Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='relative'>
                    {!imageError ? (
                      <img
                        src={donation.donationProofImage}
                        alt='Bukti Pembayaran'
                        className='w-full max-w-md mx-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity'
                        onError={() => setImageError(true)}
                        onClick={() =>
                          window.open(donation.donationProofImage!, '_blank')
                        }
                      />
                    ) : (
                      <div className='w-full max-w-md mx-auto h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center'>
                        <div className='text-center text-gray-500'>
                          <ImageIcon className='w-8 h-8 mx-auto mb-2' />
                          <p className='text-sm'>Gagal memuat gambar</p>
                        </div>
                      </div>
                    )}
                    <div className='mt-2 text-center'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          window.open(donation.donationProofImage!, '_blank')
                        }
                        className='text-xs'
                      >
                        <Eye className='w-3 h-3 mr-1' />
                        Lihat Full Size
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Information */}
            {donation.verifiedByAdmin && (
              <Card className='gap-0'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <Shield className='w-4 h-4' />
                    Informasi Verifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-3'>
                    <User className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {donation.verifiedByAdmin.fullName ||
                          donation.verifiedByAdmin.email}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Diverifikasi oleh Admin
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Actions */}
            {(donation.status === 'pending_verification' ||
              donation.status === 'verified') && (
              <Card className='gap-0'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <Shield className='w-4 h-4' />
                    Kelola Donasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Status Actions */}
                  {donation.status === 'pending_verification' && (
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                        Verifikasi Donasi
                      </p>
                      <div className='flex gap-2'>
                        {onVerify && (
                          <Button
                            onClick={() => onVerify(donation.id)}
                            disabled={isVerifying || isRejecting}
                            className='flex-1 bg-green-500 hover:bg-green-600'
                          >
                            <CheckCircle className='w-4 h-4 mr-2' />
                            {isVerifying ? 'Memverifikasi...' : 'Verifikasi'}
                          </Button>
                        )}
                        {onReject && (
                          <Button
                            onClick={() => onReject(donation.id)}
                            disabled={isVerifying || isRejecting}
                            variant='outline'
                            className='flex-1 border-red-200 text-red-700 hover:bg-red-50'
                          >
                            <XCircle className='w-4 h-4 mr-2' />
                            {isRejecting ? 'Menolak...' : 'Tolak'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {donation.status === 'verified' && onConfirm && (
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                        Konfirmasi Donasi
                      </p>
                      <Button
                        onClick={() => onConfirm(donation.id)}
                        disabled={isConfirming}
                        className='w-full bg-blue-500 hover:bg-blue-600'
                      >
                        <CheckCircle className='w-4 h-4 mr-2' />
                        {isConfirming ? 'Mengkonfirmasi...' : 'Konfirmasi'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <DrawerFooter className='flex-shrink-0'>
              <DrawerClose asChild>
                <Button variant='outline'>Tutup</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
