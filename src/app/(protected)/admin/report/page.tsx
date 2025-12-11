'use client';

import { useState, Suspense } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { ReportFilters } from './types';
import { ReportHeader, ReportFilterDrawer, ReportList } from './components';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Route } from 'next';
import Loader from '@/components/shared/loader';

function ReportPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // URL State Management
  const [queryParams, setQueryParams] = useQueryParams<ReportFilters>({
    search: '',
    tags: [],
  });

  // Filter handlers
  const handleApplyFilters = async () => {
    // Invalidate queries to trigger refetch with new filters
    await queryClient.invalidateQueries({
      queryKey: ['reports'],
    });
    setIsFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setQueryParams({ search: '', tags: [] });
    setIsFilterDrawerOpen(false);
  };

  // Report actions
  const handleCreateReport = () => {
    router.push('/admin/report/add' as Route);
  };

  return (
    <div>
      <div>
        <div className='space-y-6'>
          {/* Header */}
          <ReportHeader />

          {/* Add Report Button and Filter */}
          <div className='flex justify-between items-center gap-2'>
            <Button
              onClick={handleCreateReport}
              className='flex items-center gap-2'
            >
              <Plus className='w-4 h-4' />
              Tambah Laporan
            </Button>
            <Drawer
              direction='bottom'
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Filter className='w-4 h-4' />
                  Filter
                  {(queryParams.search ||
                    (queryParams.tags && queryParams.tags.length > 0)) && (
                    <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                      {[
                        queryParams.search ? 1 : 0,
                        queryParams.tags?.length || 0,
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
                  <DrawerHeader className='flex-shrink-0'>
                    <DrawerTitle>Filter Laporan</DrawerTitle>
                    <DrawerDescription>
                      Saring laporan berdasarkan kriteria yang diinginkan
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className='flex-1 px-4 pb-4'>
                    <ReportFilterDrawer
                      filters={queryParams}
                      onFiltersChange={setQueryParams}
                      onApply={handleApplyFilters}
                      onReset={handleResetFilters}
                    />
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

          {/* Report List */}
          <ReportList search={queryParams.search} tags={queryParams.tags} />
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ReportPageContent />
    </Suspense>
  );
}
