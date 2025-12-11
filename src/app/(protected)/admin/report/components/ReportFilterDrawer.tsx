'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { CreatableMultiSelect } from '@/components/ui/creatable-multi-select';
import type { ReportFilters } from '../types';

interface ReportFilterDrawerProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

export function ReportFilterDrawer({
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: ReportFilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const { data: tags = [] } = trpc.report.getTags.useQuery();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, search: value }));
  };

  const handleTagsChange = (tags: string[]) => {
    setLocalFilters(prev => ({ ...prev, tags }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
  };

  const handleReset = () => {
    const resetFilters = { search: '', tags: [] };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  return (
    <div className='space-y-6'>
      {/* Search Input */}
      <div className='space-y-2'>
        <Label htmlFor='search'>Cari Laporan</Label>
        <Input
          id='search'
          type='text'
          placeholder='Cari berdasarkan judul atau deskripsi...'
          value={localFilters.search}
          onChange={e => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Tags Filter */}
      <div className='space-y-2'>
        <Label htmlFor='tags'>Filter berdasarkan Tag</Label>
        <CreatableMultiSelect
          options={tags}
          value={localFilters.tags || []}
          onChange={handleTagsChange}
          placeholder='Pilih atau buat tag baru...'
          createText='Buat tag baru'
        />
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2 pt-4'>
        <Button onClick={handleReset} variant='outline' className='flex-1'>
          Reset
        </Button>
        <Button onClick={handleApply} className='flex-1'>
          Terapkan
        </Button>
      </div>
    </div>
  );
}
