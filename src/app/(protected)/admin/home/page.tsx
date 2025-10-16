'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  Calendar,
  Banknote,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTRPCClient } from '@/utils/trpc';
import { formatCurrencyCompact } from '@/lib/currency-utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const trpcClient = useTRPCClient();

  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  // Use TanStack Query for users data
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!isAdmin)
        return {
          users: [],
          stats: { total: 0, active: 0, pending: 0, scheduled: 0 },
        };

      try {
        return await trpcClient.user.getAllUsers.query({
          page: 1,
          limit: 100,
          status: 'all',
          role: 'all',
        });
      } catch (error) {
        console.error('Error loading users:', error);
        return {
          users: [],
          stats: { total: 0, active: 0, pending: 0, scheduled: 0 },
        };
      }
    },
    enabled: isAdmin,
  });

  // Use TanStack Query for programs data
  const { data: programsData, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['admin-programs'],
    queryFn: async () => {
      if (!isAdmin) return { programs: [] };

      try {
        return await trpcClient.program.getAll.query({
          limit: 50,
          offset: 0,
        });
      } catch (error) {
        console.error('Error loading programs:', error);
        return { programs: [] };
      }
    },
    enabled: isAdmin,
  });

  // Use TanStack Query for program statistics
  const { data: programStatsData, isLoading: isLoadingProgramStats } = useQuery(
    {
      queryKey: ['admin-program-stats'],
      queryFn: async () => {
        if (!isAdmin)
          return {
            totalActivePrograms: 0,
            totalEndedPrograms: 0,
            totalDonators: 0,
            totalDonationAmount: 0,
          };

        try {
          return await trpcClient.program.getProgramStats.query();
        } catch (error) {
          console.error('Error loading program stats:', error);
          return {
            totalActivePrograms: 0,
            totalEndedPrograms: 0,
            totalDonators: 0,
            totalDonationAmount: 0,
          };
        }
      },
      enabled: isAdmin,
    }
  );

  // Use TanStack Query for pending donations count
  const { data: pendingDonationsData, isLoading: isLoadingPendingDonations } =
    useQuery({
      queryKey: ['admin-pending-donations-count'],
      queryFn: async () => {
        if (!isAdmin) return { donations: [] };

        try {
          const result = await trpcClient.donation.getPendingDonations.query({
            limit: 1, // We only need the count, not the actual data
          });
          return result;
        } catch (error) {
          console.error('Error loading pending donations count:', error);
          return { donations: [] };
        }
      },
      enabled: isAdmin,
    });

  const users = usersData?.users || [];
  const programs = programsData?.programs || [];
  const programStats = programStatsData || {
    totalActivePrograms: 0,
    totalEndedPrograms: 0,
    totalDonators: 0,
    totalDonationAmount: 0,
  };

  if (
    status === 'loading' ||
    (isAdmin &&
      (isLoadingUsers ||
        isLoadingPrograms ||
        isLoadingProgramStats ||
        isLoadingPendingDonations))
  ) {
    return (
      <div className='bg-white dark:bg-gray-900'>
        <div className='space-y-6'>
          {/* Header Skeleton */}
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-48' />
            </div>
            <Skeleton className='h-8 w-16' />
          </div>

          {/* Cards Skeleton */}
          <div className='space-y-6'>
            {/* User Management Section */}
            <div className='space-y-3'>
              <Skeleton className='h-4 w-40' />
              <div className='grid grid-cols-2 gap-3'>
                <Skeleton className='h-20 w-full rounded-lg' />
                <Skeleton className='h-20 w-full rounded-lg' />
              </div>
            </div>

            {/* Program Management Section */}
            <div className='space-y-3'>
              <Skeleton className='h-4 w-40' />
              <div className='grid grid-cols-2 gap-3'>
                <Skeleton className='h-20 w-full rounded-lg' />
                <Skeleton className='h-20 w-full rounded-lg' />
                <Skeleton className='h-20 w-full rounded-lg col-span-2' />
              </div>
            </div>

            {/* Financial Section */}
            <div className='space-y-3'>
              <Skeleton className='h-4 w-40' />
              <div className='space-y-3'>
                <Skeleton className='h-24 w-full rounded-lg' />
                <div className='grid grid-cols-2 gap-3'>
                  <Skeleton className='h-20 w-full rounded-lg' />
                  <Skeleton className='h-20 w-full rounded-lg' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return router.replace('/'); // Will redirect
  }

  return (
    <div>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Beranda Admin
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Kelola pengguna dan pengaturan sistem
            </p>
          </div>
          <Badge variant='outline' className='flex items-center gap-2'>
            <Shield className='w-4 h-4' />
            Admin
          </Badge>
        </div>

        {/* Enhanced Summary Cards */}
        <div className='space-y-6'>
          {/* User Management Section */}
          <div className='space-y-3'>
            <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
              Manajemen Pengguna
            </h2>
            <div className='grid grid-cols-2 gap-3'>
              {/* Total Users Card */}
              <Card className='border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                <CardContent className='p-5'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide'>
                        Total Pengguna
                      </p>
                      <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                        {users.length}
                      </p>
                    </div>
                    <div className='p-3 bg-blue-200 dark:bg-blue-800 rounded-xl'>
                      <Users className='w-6 h-6 text-blue-700 dark:text-blue-300' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Admins Card */}
              <Card className='border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                <CardContent className='p-5'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide'>
                        Admin
                      </p>
                      <p className='text-2xl font-bold text-purple-900 dark:text-purple-100'>
                        {
                          users.filter(
                            (user: { role: string }) => user.role === 'admin'
                          ).length
                        }
                      </p>
                    </div>
                    <div className='p-3 bg-purple-200 dark:bg-purple-800 rounded-xl'>
                      <Shield className='w-6 h-6 text-purple-700 dark:text-purple-300' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Program Management Section */}
          <div className='space-y-3'>
            <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
              Manajemen Program
            </h2>
            <div className='grid grid-cols-2 gap-3'>
              {/* Active Programs Card */}
              <Card className='border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                <CardContent className='p-5'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide'>
                        Program Aktif
                      </p>
                      <p className='text-2xl font-bold text-green-900 dark:text-green-100'>
                        {programStats.totalActivePrograms}
                      </p>
                    </div>
                    <div className='p-3 bg-green-200 dark:bg-green-800 rounded-xl'>
                      <CheckCircle className='w-6 h-6 text-green-700 dark:text-green-300' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Programs Card */}
              <Card className='border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                <CardContent className='p-5'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wide'>
                        Total Program
                      </p>
                      <p className='text-2xl font-bold text-indigo-900 dark:text-indigo-100'>
                        {programs.length}
                      </p>
                    </div>
                    <div className='p-3 bg-indigo-200 dark:bg-indigo-800 rounded-xl'>
                      <Calendar className='w-6 h-6 text-indigo-700 dark:text-indigo-300' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Programs Card */}
              <Card className='border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] col-span-2'>
                <CardContent className='p-5'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
                        Program Selesai
                      </p>
                      <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                        {programStats.totalEndedPrograms}
                      </p>
                    </div>
                    <div className='p-3 bg-gray-200 dark:bg-gray-600 rounded-xl'>
                      <CheckCircle className='w-6 h-6 text-gray-700 dark:text-gray-300' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Financial & Donations Section */}
          <div className='space-y-3'>
            <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
              Keuangan & Donasi
            </h2>
            <div className='grid grid-cols-1 gap-3'>
              {/* Total Donations Amount Card - Featured */}
              <Card className='border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide'>
                        Total Dana Terkumpul
                      </p>
                      <p className='text-3xl font-bold text-emerald-900 dark:text-emerald-100'>
                        {formatCurrencyCompact(
                          programStats.totalDonationAmount
                        )}
                      </p>
                    </div>
                    <div className='p-4 bg-emerald-200 dark:bg-emerald-800 rounded-xl'>
                      <Banknote className='w-8 h-8 text-emerald-700 dark:text-emerald-300' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className='grid grid-cols-2 gap-3'>
                {/* Total Donators Card */}
                <Card className='border-0 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                  <CardContent className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wide'>
                          Total Donatur
                        </p>
                        <p className='text-2xl font-bold text-teal-900 dark:text-teal-100'>
                          {programStats.totalDonators}
                        </p>
                      </div>
                      <div className='p-3 bg-teal-200 dark:bg-teal-800 rounded-xl'>
                        <TrendingUp className='w-6 h-6 text-teal-700 dark:text-teal-300' />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Donations Card */}
                <Card className='border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
                  <CardContent className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide'>
                          Menunggu Verifikasi
                        </p>
                        <p className='text-2xl font-bold text-orange-900 dark:text-orange-100'>
                          {pendingDonationsData &&
                          'pagination' in pendingDonationsData
                            ? pendingDonationsData.pagination.totalCount
                            : 0}
                        </p>
                      </div>
                      <div className='p-3 bg-orange-200 dark:bg-orange-800 rounded-xl'>
                        <Clock className='w-6 h-6 text-orange-700 dark:text-orange-300' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
