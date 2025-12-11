'use client';

import { useSession } from 'next-auth/react';
import BottomNavigationUser from '@/components/layout/bottom-navigation-user';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/utils/trpc';
import { formatCurrency, formatCurrencyCompact } from '@/lib/currency-utils';
import { formatDateWIB } from '@/utils/dateFormat';
import {
  Heart,
  Target,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Banknote,
  Activity,
  FileText,
  Eye,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ImagePreviewModal } from '@/components/shared/image-preview';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Beranda() {
  const { data: session, status } = useSession();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<{
    fileUrl: string;
    title: string;
  } | null>(null);

  // Get user profile data
  const { data: userProfile } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!session,
  });

  // Get user donations
  const { data: userDonations } = trpc.donation.getUserDonations.useQuery(
    { limit: 5, status: 'verified' },
    { enabled: !!session }
  );

  // Get program stats for overview
  const { data: programStats } = trpc.program.getProgramStats.useQuery();

  // Get latest reports
  const { data: latestReports } = trpc.report.getLatest.useQuery({
    limit: 5,
  });

  if (status === 'loading') {
    return (
      <div className='bg-white dark:bg-gray-900'>
        <div className='space-y-6'>
          <Skeleton className='h-32 w-full' />
          <div className='space-y-4'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-24 w-full' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className='bg-white dark:bg-gray-900'>
        <div className='min-h-screen flex items-center justify-center px-4'>
          <div className='text-center space-y-6 max-w-md'>
            <div className='w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
              <Heart className='w-10 h-10 text-green-600 dark:text-green-400' />
            </div>
            <div className='space-y-2'>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Selamat Datang di Berjamaah
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                Platform donasi untuk program-program kebaikan yang bermakna
              </p>
            </div>
            <div className='space-y-3'>
              <Button asChild className='w-full'>
                <Link href='/signin'>Masuk</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const donations = userDonations?.donations || [];
  const stats = programStats || {
    totalActivePrograms: 0,
    totalDonators: 0,
    totalDonationAmount: 0,
  };

  // Calculate user's total donations
  const userTotalDonations = donations.reduce((sum, donation) => {
    if (donation.status === 'verified') {
      return sum + Number(donation.amount);
    }
    return sum;
  }, 0);

  const userVerifiedDonations = donations.filter(
    d => d.status === 'verified'
  ).length;

  const userPendingDonations = donations.filter(
    d => d.status === 'pending'
  ).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className='w-4 h-4 text-green-600' />;
      case 'pending':
        return <Clock className='w-4 h-4 text-yellow-600' />;
      case 'rejected':
        return <XCircle className='w-4 h-4 text-red-600' />;
      default:
        return <AlertCircle className='w-4 h-4 text-gray-600' />;
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
          {/* Welcome Header */}
          <div className='text-center space-y-2'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Selamat Datang, {userProfile?.fullName || 'Sahabat'}!
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Mari bersama-sama berbuat kebaikan
            </p>
          </div>

          {/* Enhanced Summary Cards */}
          <div className='space-y-6'>
            {/* Personal Donation Section */}
            <div className='space-y-3'>
              <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
                Donasi Saya
              </h2>
              <div className='grid grid-cols-2 gap-3'>
                {/* Total Donations Card */}
                <Card className='border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                  <CardContent className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide'>
                          Total Donasi
                        </p>
                        <p className='text-lg font-bold text-green-900 dark:text-green-100'>
                          {formatCurrencyCompact(userTotalDonations)}
                        </p>
                      </div>
                      <div className='p-3 bg-green-200 dark:bg-green-800 rounded-xl'>
                        <Heart className='w-6 h-6 text-green-700 dark:text-green-300' />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Programs Participated Card */}
                <Card className='border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                  <CardContent className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide'>
                          Program Diikuti
                        </p>
                        <p className='text-lg font-bold text-blue-900 dark:text-blue-100'>
                          {userVerifiedDonations}
                        </p>
                      </div>
                      <div className='p-3 bg-blue-200 dark:bg-blue-800 rounded-xl'>
                        <Target className='w-6 h-6 text-blue-700 dark:text-blue-300' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Donations Card */}
              {userPendingDonations > 0 && (
                <Card className='border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                  <CardContent className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-yellow-700 dark:text-yellow-300 uppercase tracking-wide'>
                          Menunggu Verifikasi
                        </p>
                        <p className='text-lg font-bold text-yellow-900 dark:text-yellow-100'>
                          {userPendingDonations}
                        </p>
                      </div>
                      <div className='p-3 bg-yellow-200 dark:bg-yellow-800 rounded-xl'>
                        <Clock className='w-6 h-6 text-yellow-700 dark:text-yellow-300' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Platform Overview Section */}
            <div className='space-y-3'>
              <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
                Platform Overview
              </h2>
              <div className='grid grid-cols-2 gap-3'>
                {/* Active Programs Card */}
                <Card className='border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                  <CardContent className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide'>
                          Program Aktif
                        </p>
                        <p className='text-lg font-bold text-emerald-900 dark:text-emerald-100'>
                          {stats.totalActivePrograms}
                        </p>
                      </div>
                      <div className='p-3 bg-emerald-200 dark:bg-emerald-800 rounded-xl'>
                        <Activity className='w-6 h-6 text-emerald-700 dark:text-emerald-300' />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Donators Card */}
                <Card className='border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                  <CardContent className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide'>
                          Total Donatur
                        </p>
                        <p className='text-lg font-bold text-purple-900 dark:text-purple-100'>
                          {stats.totalDonators}
                        </p>
                      </div>
                      <div className='p-3 bg-purple-200 dark:bg-purple-800 rounded-xl'>
                        <Users className='w-6 h-6 text-purple-700 dark:text-purple-300' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Total Amount Raised Card - Featured */}
              <Card className='border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wide'>
                        Total Dana Terkumpul
                      </p>
                      <p className='text-3xl font-bold text-indigo-900 dark:text-indigo-100'>
                        {formatCurrencyCompact(stats.totalDonationAmount)}
                      </p>
                    </div>
                    <div className='p-4 bg-indigo-200 dark:bg-indigo-800 rounded-xl'>
                      <Banknote className='w-8 h-8 text-indigo-700 dark:text-indigo-300' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Section */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
                  Laporan Terbaru
                </h2>
                {latestReports && latestReports.length > 0 && (
                  <Button variant='ghost' size='sm' asChild>
                    <Link href='/reports'>
                      Lihat Semua
                      <ArrowRight className='w-4 h-4 ml-1' />
                    </Link>
                  </Button>
                )}
              </div>
              {latestReports && latestReports.length > 0 ? (
                <div className='space-y-3'>
                  {latestReports.slice(0, 5).map(report => (
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
                </div>
              ) : (
                <Card className='border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
                  <CardContent className='p-6'>
                    <div className='text-center space-y-2'>
                      <FileText className='w-12 h-12 text-gray-400 mx-auto' />
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Belum ada laporan yang tersedia
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Donations Section */}
            {donations.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
                    Donasi Terbaru
                  </h2>
                  <Button variant='ghost' size='sm' asChild>
                    <Link href='/donations'>
                      Lihat Semua
                      <ArrowRight className='w-4 h-4 ml-1' />
                    </Link>
                  </Button>
                </div>
                <div className='space-y-4'>
                  {donations.slice(0, 3).map(donation => (
                    <Card
                      key={donation.id}
                      className='py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 group'
                    >
                      <CardContent className='p-3'>
                        <div className='flex items-start gap-3'>
                          {/* Icon and visual indicator */}
                          <div className='flex-shrink-0 mt-0.5'>
                            <div className='w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200'>
                              <Banknote className='w-4 h-4 text-green-600 dark:text-green-400' />
                            </div>
                          </div>

                          {/* Main content */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between gap-2'>
                              <div className='flex-1 min-w-0'>
                                <h4 className='font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate'>
                                  {donation.program.title}
                                </h4>
                                <div className='flex items-center gap-2 mt-1'>
                                  <span className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1'>
                                    <Activity className='w-3 h-3' />
                                    {formatDateWIB(donation.createdAt)}
                                  </span>
                                </div>
                              </div>

                              {/* Amount and status */}
                              <div className='text-right flex-shrink-0'>
                                <p className='font-bold text-green-600 dark:text-green-400 text-sm'>
                                  {formatCurrency(Number(donation.amount))}
                                </p>
                                <Badge
                                  className={`text-xs px-2 py-0.5 mt-1 ${getStatusColor(donation.status)}`}
                                >
                                  <div className='flex items-center gap-1'>
                                    {getStatusIcon(donation.status)}
                                    <span>
                                      {getStatusText(donation.status)}
                                    </span>
                                  </div>
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <Card className='border-0 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 shadow-sm hover:shadow-md transition-all duration-200'>
              <CardContent className='p-6 text-center space-y-4'>
                <div className='w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
                  <Users className='w-8 h-8 text-green-600 dark:text-green-400' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Berlomba-lomba dalam Kebaikan
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400'>
                    &quot;Dan berlomba-lombalah kamu kepada (mendapatkan)
                    ampunan dari Tuhanmu dan surga yang luasnya seluas langit
                    dan bumi.&quot;
                  </p>
                  <p className='text-gray-600 dark:text-gray-400'>
                    (QS. Al-Hadid: 21)
                  </p>
                </div>
                <Button asChild className='w-full'>
                  <Link href='/programs'>
                    Lihat Program Donasi
                    <ArrowRight className='w-4 h-4 ml-2' />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
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
