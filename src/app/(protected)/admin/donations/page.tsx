'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Search, Filter } from 'lucide-react';
import { DonationConfirmationList } from '@/features/admin/donation-confirmation-list';
import Loader from '@/components/shared/loader';
import { useTRPCClient } from '@/utils/trpc';

function DonationsPageContent(): React.JSX.Element | null {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'verified' | 'rejected' | 'all'
  >('pending');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [programOptions, setProgramOptions] = useState<
    Array<{ id: string; title: string }>
  >([]);

  const trpcClient = useTRPCClient();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const programs = await trpcClient.donation.getPrograms.query({
          status: 'active',
          limit: 100,
          offset: 0,
        });
        if (isMounted) {
          // programs are transformed shape in router; ensure id and title exist
          setProgramOptions(
            (programs as Array<{ id: string; title: string }>).map(p => ({
              id: p.id,
              title: p.title,
            }))
          );
        }
      } catch {
        // ignore fetch errors in UI
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [trpcClient]);

  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  if (status === 'loading') {
    return <Loader />;
  }

  if (!isAdmin) {
    router.replace('/'); // Will redirect
    return null;
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as 'pending' | 'verified' | 'rejected' | 'all');
  };

  const handleApplyFilters = () => {
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    // Reset status filter to default (search is handled separately)
    setStatusFilter('pending');
    setProgramFilter('all');
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
  };

  return (
    <div>
      <div>
        <div className='space-y-6'>
          {/* Header */}
          <div>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Kelola Donasi
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Verifikasi dan kelola donasi dari pengguna
            </p>
          </div>

          {/* Search and Filter */}
          <div className='flex justify-between items-center gap-4'>
            {/* Search Input */}
            <div className='relative w-80'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                type='text'
                placeholder='Cari donatur...'
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className='pl-10 h-9'
              />
            </div>

            {/* Filter Button */}
            <Drawer
              direction='bottom'
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Filter className='w-4 h-4' />
                  Filter
                  {(statusFilter !== 'pending' ||
                    programFilter !== 'all') && (
                    <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                      {(
                        Number(statusFilter !== 'pending') +
                        Number(programFilter !== 'all')
                      ).toString()}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
                  <DrawerHeader className='flex-shrink-0'>
                    <DrawerTitle>Filter Donasi</DrawerTitle>
                    <DrawerDescription>
                      Saring donasi berdasarkan kriteria yang diinginkan
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className='flex-1 px-4 pb-4'>
                    <div className='space-y-6'>
                      {/* Status Filter */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Status Donasi
                        </label>
                        <Select
                          value={statusFilter}
                          onValueChange={handleStatusChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pending'>
                              Menunggu Verifikasi
                            </SelectItem>
                            <SelectItem value='verified'>
                              Terverifikasi
                            </SelectItem>
                            <SelectItem value='rejected'>Ditolak</SelectItem>
                            <SelectItem value='all'>Semua Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Program Filter */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Program
                        </label>
                        <Select
                          value={programFilter}
                          onValueChange={setProgramFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih program' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='all'>Semua Program</SelectItem>
                            {programOptions.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex gap-3 pt-4'>
                        <Button
                          variant='outline'
                          onClick={handleResetFilters}
                          className='flex-1'
                        >
                          Reset
                        </Button>
                        <Button onClick={handleApplyFilters} className='flex-1'>
                          Terapkan
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DrawerFooter className='flex-shrink-0'>
                    <DrawerClose asChild>
                      <Button variant='outline'>Tutup</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Donation List */}
          <DonationConfirmationList
            status={statusFilter === 'all' ? undefined : statusFilter}
            search={search}
            programId={programFilter === 'all' ? undefined : programFilter}
          />
        </div>
      </div>
    </div>
  );
}

export default function DonationsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <DonationsPageContent />
    </Suspense>
  );
}
