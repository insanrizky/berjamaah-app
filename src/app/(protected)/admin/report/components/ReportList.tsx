'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { ReportListCard } from './ReportListCard';

interface ReportListProps {
  search?: string;
  tags?: string[];
  className?: string;
}

export function ReportList({ search, tags, className }: ReportListProps) {
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['reports', search, tags],
    });
  }, [queryClient, search, tags]);

  return (
    <PullToRefresh onRefreshAction={handleRefresh}>
      <ReportListCard search={search} tags={tags} className={className} />
    </PullToRefresh>
  );
}
