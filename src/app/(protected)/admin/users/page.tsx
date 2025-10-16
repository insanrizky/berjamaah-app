'use client';

import { useState, Suspense } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useQueryParams } from '@/hooks/use-query-params';
import { UserFilters } from './types';
import { UsersHeader, UserFilterDrawer } from './components';
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
import { UserList } from './components/UserList';
import Loader from '@/components/shared/loader';

function UsersPageContent() {
  const router = useRouter();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // URL State Management
  const [queryParams, setQueryParams] = useQueryParams<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
  });

  // Filter handlers
  const handleApplyFilters = () => {
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    // Reset filters to default
    setQueryParams({ search: '', status: 'all', role: 'all' });
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
  };

  // User actions
  const handleCreateUser = () => {
    router.push('/admin/users/add' as Route);
  };

  return (
    <div>
      <div>
        <div className='space-y-6'>
          {/* Header */}
          <UsersHeader />

          {/* Add User Button and Filter */}
          <div className='flex justify-between items-center gap-2'>
            <Button
              onClick={handleCreateUser}
              className='flex items-center gap-2'
            >
              <Plus className='w-4 h-4' />
              Tambah Pengguna
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
                  {Object.keys(queryParams).some(key => {
                    const value = queryParams[key as keyof typeof queryParams];
                    return value && value !== 'all' && value !== '';
                  }) && (
                    <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                      {
                        Object.entries(queryParams).filter(([, value]) => {
                          return value && value !== 'all' && value !== '';
                        }).length
                      }
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
                  <DrawerHeader className='flex-shrink-0'>
                    <DrawerTitle>Filter Pengguna</DrawerTitle>
                    <DrawerDescription>
                      Saring pengguna berdasarkan kriteria yang diinginkan
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className='flex-1 px-4 pb-4'>
                    <UserFilterDrawer
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

          {/* User List */}
          <UserList
            search={queryParams.search}
            status={queryParams.status}
            role={queryParams.role}
          />
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<Loader />}>
      <UsersPageContent />
    </Suspense>
  );
}
