'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
import Loader from '@/components/shared/loader';
import { ProgramDetailDrawer } from '@/features/program/program-detail-drawer';
import { ProgramFilterDrawer } from '@/features/program/program-filter-drawer';
import { ProgramList } from '@/features/program/program-list';
import { useQueryParams } from '@/hooks/use-query-params';

function ProgramPageContent() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Use query params for filters
  const [filters, setFilters] = useQueryParams({
    status: 'all',
    category: 'all',
  });

  const handleApplyFilters = () => {
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    // Reset filters to default
    setFilters({ status: 'all', category: 'all' });
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
  };

  // Handle program selection
  const handleProgramSelect = (programId: string) => {
    setSelectedProgramId(programId);
    setIsDrawerOpen(true);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedProgramId(null);
  };

  // Handle program deletion
  const handleProgramDelete = () => {
    // Close drawer and let the ProgramList component handle refetching
    setIsDrawerOpen(false);
    setSelectedProgramId(null);
  };

  return (
    <div>
      <div>
        <div className='space-y-6'>
          {/* Header */}
          <div>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Daftar Program
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Kelola program dan pantau perkembangannya.
            </p>
          </div>

          {/* Add Program Button and Filter */}
          <div className='flex justify-between items-center gap-2'>
            <Link href='/admin/program/add'>
              <Button className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                Tambah Program
              </Button>
            </Link>
            <Drawer
              direction='bottom'
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button variant='outline' className='flex items-center gap-2'>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                    />
                  </svg>
                  Filter
                  {Object.keys(filters).some(key => {
                    const value = filters[key as keyof typeof filters];
                    return value && value !== 'all';
                  }) && (
                    <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                      {
                        Object.entries(filters).filter(([, value]) => {
                          return value && value !== 'all';
                        }).length
                      }
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
                  <DrawerHeader className='flex-shrink-0'>
                    <DrawerTitle>Filter Program</DrawerTitle>
                    <DrawerDescription>
                      Saring program berdasarkan kriteria yang diinginkan
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className='flex-1 px-4 pb-4'>
                    <ProgramFilterDrawer
                      filters={filters}
                      onFiltersChange={setFilters}
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

          {/* Program List */}
          <ProgramList
            status={
              filters.status as
                | 'all'
                | 'draft'
                | 'active'
                | 'inactive'
            }
            category={filters.category}
            onProgramSelect={handleProgramSelect}
          />
        </div>
      </div>

      {/* Program Detail Drawer */}
      {selectedProgramId && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
              <DrawerHeader className='flex-shrink-0'>
                <DrawerTitle>Detail Program</DrawerTitle>
                <DrawerDescription>
                  Informasi lengkap tentang program ini
                </DrawerDescription>
              </DrawerHeader>
              <div className='flex-1 px-4 pb-4'>
                <ProgramDetailDrawer
                  programId={selectedProgramId}
                  isOpen={isDrawerOpen}
                  onCloseAction={handleDrawerClose}
                  onDelete={handleProgramDelete}
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
      )}
    </div>
  );
}

export default function ProgramPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProgramPageContent />
    </Suspense>
  );
}
