'use client';

import { Button } from '@/components/ui/button';
import { SearchInput } from './SearchInput';
import { StatusSelect } from './StatusSelect';
import { RoleSelect } from './RoleSelect';

interface UserFilterDrawerProps {
  filters: {
    search: string;
    status: string;
    role: string;
  };
  onFiltersChange: (filters: Partial<{ search: string; status: string; role: string }>) => void;
  onApply: () => void;
  onReset: () => void;
}

export function UserFilterDrawer({
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: UserFilterDrawerProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ status: value });
  };

  const handleRoleChange = (value: string) => {
    onFiltersChange({ role: value });
  };

  return (
    <div className='space-y-6'>
      {/* Search */}
      <div className='space-y-2'>
        <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
          Pencarian
        </label>
        <SearchInput
          value={filters.search}
          onChangeAction={handleSearchChange}
          placeholder='Cari berdasarkan nama atau email...'
        />
      </div>

      {/* Status Filter */}
      <div className='space-y-2'>
        <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
          Status Pengguna
        </label>
        <StatusSelect
          value={filters.status}
          onChange={handleStatusChange}
        />
      </div>

      {/* Role Filter */}
      <div className='space-y-2'>
        <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
          Peran Pengguna
        </label>
        <RoleSelect
          value={filters.role}
          onChange={handleRoleChange}
        />
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3 pt-4'>
        <Button
          variant='outline'
          onClick={onReset}
          className='flex-1'
        >
          Reset
        </Button>
        <Button
          onClick={onApply}
          className='flex-1'
        >
          Terapkan
        </Button>
      </div>
    </div>
  );
}
