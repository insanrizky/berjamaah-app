'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/utils/trpc';
import Loader from '@/components/shared/loader';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/image-url';
import { ClickableImage } from '@/components/shared/image-preview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Target,
  Users,
  Banknote,
  FileText,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface Program {
  id: string;
  title: string;
  description: string;
  targetAmount: string; // Changed from number to string to match database
  category: string | null;
  status: string; // Changed to string to match database return type
  contact?: string | null;
  details?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    fullName: string | null;
  } | null;
  // donations array is not included in getById query, only _count.donations
  _count: {
    donations: number;
  };
  totalRaisedAmount: number;
  totalDonationCount: number;
  progressPercentage: number;
}

interface ProgramDetailDrawerProps {
  programId: string;
  isOpen: boolean;
  onCloseAction: () => void;
  onDelete?: () => void;
}

export function ProgramDetailDrawer({
  programId,
  isOpen,
  onCloseAction,
  onDelete,
}: ProgramDetailDrawerProps) {
  const {
    data: program,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      return await trpcClient.program.getById.query({ id: programId });
    },
    enabled: isOpen && !!programId,
  });

  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>(
    {}
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: string) => {
      return await trpcClient.program.delete.mutate({ id: programId });
    },
    onSuccess: () => {
      toast.success('Program berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setIsDeleteDialogOpen(false);
      onCloseAction();
      onDelete?.();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus program');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      programId,
      status,
    }: {
      programId: string;
      status: string;
    }) => {
      return await trpcClient.program.updateProgramStatus.mutate({
        id: programId,
        status: status as 'draft' | 'active' | 'inactive',
      });
    },
    onSuccess: () => {
      toast.success('Status program berhasil diperbarui');
      // Invalidate all relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      queryClient.invalidateQueries({ queryKey: ['programStats'] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui status program');
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async (updateData: { id: string; bannerImage: string }) => {
      return await trpcClient.program.update.mutate(updateData);
    },
    onSuccess: () => {
      toast.success('Gambar program berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      setIsEditingImage(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui gambar program');
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      if (!result.success || !result.url) {
        throw new Error('Invalid response from upload service');
      }

      // Update the program with the new image URL
      updateProgramMutation.mutate({
        id: programId,
        bannerImage: result.url,
      });
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengupload gambar. Silakan coba lagi.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteProgram = () => {
    if (program) {
      deleteProgramMutation.mutate(program.id);
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (program) {
      updateStatusMutation.mutate({ programId: program.id, status: newStatus });
    }
  };

  const handleEditField = (fieldName: string) => {
    if (!program) return;

    setEditingFields(prev => ({ ...prev, [fieldName]: true }));

    // Set initial value for the field
    const initialValue = (program[fieldName as keyof Program] as string) || '';
    setFieldValues(prev => ({ ...prev, [fieldName]: initialValue }));
  };

  const handleCancelFieldEdit = (fieldName: string) => {
    setEditingFields(prev => ({ ...prev, [fieldName]: false }));
    setFieldValues(prev => ({ ...prev, [fieldName]: '' }));
  };

  const handleSaveField = async (fieldName: string) => {
    if (!program) return;

    const value = fieldValues[fieldName];
    if (!value) return;

    try {
      const updateData = {
        id: programId,
        [fieldName]: fieldName === 'targetAmount' ? Number(value) : value,
      };

      await trpcClient.program.update.mutate(updateData);

      toast.success(`${fieldName} berhasil diperbarui`);
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });

      setEditingFields(prev => ({ ...prev, [fieldName]: false }));
      setFieldValues(prev => ({ ...prev, [fieldName]: '' }));
    } catch {
      toast.error(`Gagal memperbarui ${fieldName}`);
    }
  };

  const getAvailableStatusActions = (currentStatus: string) => {
    const statusActions: Record<
      string,
      Array<{ status: string; label: string; variant: string }>
    > = {
      draft: [
        { status: 'active', label: 'Mulai Program', variant: 'default' },
        {
          status: 'inactive',
          label: 'Nonaktifkan Program',
          variant: 'outline',
        },
      ],
      active: [
        { status: 'inactive', label: 'Akhiri Program', variant: 'destructive' },
      ],
      inactive: [
        { status: 'active', label: 'Mulai Program', variant: 'default' },
      ],
    };

    return statusActions[currentStatus] || [];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      case 'draft':
        return 'Draft';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getCreatorDisplayName = (program: Program) => {
    if (!program.createdByUser) return 'Tidak diketahui';

    const { fullName } = program.createdByUser;

    return fullName || 'Tidak diketahui';
  };

  const categories = [
    'Pendidikan',
    'Kesehatan',
    'Keagamaan',
    'Bencana',
    'Infrastruktur',
    'Sosial',
    'Lainnya',
  ];

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-500'>Error loading program: {error.message}</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500'>Program not found</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with Title and Status */}
      <div className='text-center space-y-3'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
          {program.title}
        </h2>
        <Badge
          variant='secondary'
          className={`text-sm px-3 py-1 ${getStatusColor(program.status)}`}
        >
          {getStatusText(program.status)}
        </Badge>
      </div>

      {/* Banner Image */}
      {program.bannerImage && (
        <div className='w-full'>
          <div className='relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700'>
            <ClickableImage
              src={getImageUrl(program.bannerImage)}
              alt={`Banner ${program.title}`}
              className='w-full h-full object-cover'
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Edit Image Button - Only show for draft programs */}
            {session?.user?.id === program.createdBy &&
              program.status === 'draft' && (
                <Button
                  variant='outline'
                  size='sm'
                  className='absolute top-2 right-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 z-10'
                  onClick={e => {
                    e.stopPropagation();
                    setIsEditingImage(true);
                  }}
                >
                  <svg
                    className='w-4 h-4 mr-1'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    />
                  </svg>
                  Edit
                </Button>
              )}
          </div>
        </div>
      )}

      {/* Add Image Button (if no image exists) - Only show for draft programs */}
      {!program.bannerImage &&
        session?.user?.id === program.createdBy &&
        program.status === 'draft' && (
          <div className='w-full'>
            <Button
              variant='outline'
              className='w-full h-32 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              onClick={() => setIsEditingImage(true)}
            >
              <div className='text-center'>
                <svg
                  className='w-8 h-8 mx-auto mb-2 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
                <p className='text-sm text-gray-500'>Tambah Gambar Banner</p>
              </div>
            </Button>
          </div>
        )}

      {/* Program Information Section */}
      <Card className='gap-0'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <FileText className='w-4 h-4' />
            Informasi Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Title Field */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>Judul Program</Label>
                {program.status === 'draft' &&
                  session?.user?.id === program.createdBy && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditField('title')}
                      className='h-6 w-6 p-0'
                    >
                      <svg
                        className='w-3 h-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </Button>
                  )}
              </div>
              {editingFields.title ? (
                <div className='space-y-2'>
                  <Input
                    value={fieldValues.title}
                    onChange={e =>
                      setFieldValues(prev => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder='Masukkan judul program'
                  />
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleSaveField('title')}
                      className='h-7 px-3 text-xs'
                    >
                      Simpan
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCancelFieldEdit('title')}
                      className='h-7 px-3 text-xs'
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-900 dark:text-white'>
                  {program.title}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>Deskripsi Program</Label>
                {program.status === 'draft' &&
                  session?.user?.id === program.createdBy && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditField('description')}
                      className='h-6 w-6 p-0'
                    >
                      <svg
                        className='w-3 h-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </Button>
                  )}
              </div>
              {editingFields.description ? (
                <div className='space-y-2'>
                  <Textarea
                    value={fieldValues.description}
                    onChange={e =>
                      setFieldValues(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder='Deskripsikan program secara detail...'
                    className='min-h-[100px] resize-none'
                  />
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleSaveField('description')}
                      className='h-7 px-3 text-xs'
                    >
                      Simpan
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCancelFieldEdit('description')}
                      className='h-7 px-3 text-xs'
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {program.description}
                </p>
              )}
            </div>

            {/* Target Amount Field */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>
                  Target Dana (Rupiah)
                </Label>
                {program.status === 'draft' &&
                  session?.user?.id === program.createdBy && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditField('targetAmount')}
                      className='h-6 w-6 p-0'
                    >
                      <svg
                        className='w-3 h-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </Button>
                  )}
              </div>
              {editingFields.targetAmount ? (
                <div className='space-y-2'>
                  <Input
                    type='number'
                    value={fieldValues.targetAmount}
                    onChange={e =>
                      setFieldValues(prev => ({
                        ...prev,
                        targetAmount: e.target.value,
                      }))
                    }
                    placeholder='Masukkan target dana'
                  />
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleSaveField('targetAmount')}
                      className='h-7 px-3 text-xs'
                    >
                      Simpan
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCancelFieldEdit('targetAmount')}
                      className='h-7 px-3 text-xs'
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-900 dark:text-white'>
                  {formatCurrency(Number(program.targetAmount))}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>Kategori Program</Label>
                {program.status === 'draft' &&
                  session?.user?.id === program.createdBy && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditField('category')}
                      className='h-6 w-6 p-0'
                    >
                      <svg
                        className='w-3 h-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </Button>
                  )}
              </div>
              {editingFields.category ? (
                <div className='space-y-2'>
                  <Select
                    value={fieldValues.category}
                    onValueChange={value => {
                      if (value === 'new') {
                        setShowNewCategoryInput(true);
                        setFieldValues(prev => ({ ...prev, category: '' }));
                      } else {
                        setShowNewCategoryInput(false);
                        setFieldValues(prev => ({ ...prev, category: value }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih kategori' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value='new'>
                        + Tambah Kategori Baru
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {showNewCategoryInput && (
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Masukkan kategori baru'
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                      />
                      <Button
                        type='button'
                        onClick={() => {
                          if (newCategory.trim()) {
                            setFieldValues(prev => ({
                              ...prev,
                              category: newCategory.trim(),
                            }));
                            setNewCategory('');
                            setShowNewCategoryInput(false);
                          }
                        }}
                        size='sm'
                      >
                        Tambah
                      </Button>
                    </div>
                  )}
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleSaveField('category')}
                      className='h-7 px-3 text-xs'
                    >
                      Simpan
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCancelFieldEdit('category')}
                      className='h-7 px-3 text-xs'
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-900 dark:text-white'>
                  {program.category || 'Tidak ada kategori'}
                </p>
              )}
            </div>

            {/* Contact Field */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>Kontak</Label>
                {program.status === 'draft' &&
                  session?.user?.id === program.createdBy && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditField('contact')}
                      className='h-6 w-6 p-0'
                    >
                      <svg
                        className='w-3 h-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </Button>
                  )}
              </div>
              {editingFields.contact ? (
                <div className='space-y-2'>
                  <Input
                    value={fieldValues.contact}
                    onChange={e =>
                      setFieldValues(prev => ({
                        ...prev,
                        contact: e.target.value,
                      }))
                    }
                    placeholder='Nomor telepon atau email kontak'
                  />
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleSaveField('contact')}
                      className='h-7 px-3 text-xs'
                    >
                      Simpan
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCancelFieldEdit('contact')}
                      className='h-7 px-3 text-xs'
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-900 dark:text-white'>
                  {program.contact || 'Tidak ada kontak'}
                </p>
              )}
            </div>

            {/* Details Field */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>Detail Program</Label>
                {program.status === 'draft' &&
                  session?.user?.id === program.createdBy && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditField('details')}
                      className='h-6 w-6 p-0'
                    >
                      <svg
                        className='w-3 h-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </Button>
                  )}
              </div>
              {editingFields.details ? (
                <div className='space-y-2'>
                  <Textarea
                    value={fieldValues.details}
                    onChange={e =>
                      setFieldValues(prev => ({
                        ...prev,
                        details: e.target.value,
                      }))
                    }
                    placeholder='Detail tambahan tentang program...'
                    className='min-h-[80px] resize-none'
                  />
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleSaveField('details')}
                      className='h-7 px-3 text-xs'
                    >
                      Simpan
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCancelFieldEdit('details')}
                      className='h-7 px-3 text-xs'
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {program.details || 'Tidak ada detail tambahan'}
                </p>
              )}
            </div>

            {/* Creator Info - Read Only */}
            <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
              <div className='flex items-center gap-3'>
                <TrendingUp className='w-5 h-5 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {getCreatorDisplayName(program)}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Dibuat oleh • {formatDateTime(program.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress & Funding Section */}
      <Card className='gap-0'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <Target className='w-4 h-4' />
            Progress & Pendanaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className='space-y-2 mb-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600 dark:text-gray-400'>
                Perkembangan
              </span>
              <span className='text-gray-900 dark:text-white font-medium'>
                {program.progressPercentage?.toFixed(1)}%
              </span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
              <div
                className='bg-green-600 h-3 rounded-full transition-all duration-300'
                style={{
                  width: `${Math.min(program.progressPercentage || 0, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <Banknote className='w-5 h-5 text-gray-400' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  {formatCurrency(program.totalRaisedAmount)}
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Dana Terkumpul
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Target className='w-5 h-5 text-gray-400' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  {formatCurrency(Number(program.targetAmount))}
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Target Dana
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Users className='w-5 h-5 text-gray-400' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  {program._count.donations} orang
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Total Donatur
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions - Only show if user is the creator */}
      {session?.user?.id === program?.createdBy && (
        <Card className='gap-0'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Shield className='w-4 h-4' />
              Kelola Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Status Actions */}
            {getAvailableStatusActions(program.status).length > 0 && (
              <div className='space-y-2 mb-4'>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  Ubah Status Program
                </p>
                {getAvailableStatusActions(program.status).map(action => (
                  <Button
                    key={action.status}
                    variant={
                      action.variant as 'default' | 'outline' | 'destructive'
                    }
                    size='sm'
                    className='w-full'
                    onClick={() => handleUpdateStatus(action.status)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <div className='w-4 h-4 mr-2'>
                          <Loader />
                        </div>
                        Memproses...
                      </>
                    ) : (
                      action.label
                    )}
                  </Button>
                ))}
              </div>
            )}

            {/* Delete Action */}
            <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                Zona Bahaya
              </p>
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant='destructive'
                    size='sm'
                    className='w-full'
                    disabled={deleteProgramMutation.isPending}
                  >
                    {deleteProgramMutation.isPending ? (
                      <>
                        <div className='w-4 h-4 mr-2'>
                          <Loader />
                        </div>
                        Menghapus...
                      </>
                    ) : (
                      'Hapus Program'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Program</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus program &quot;
                      {program?.title}&quot;? Tindakan ini tidak dapat
                      dibatalkan dan akan menghapus semua data program termasuk
                      periode dan donasi yang terkait.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProgram}
                      className='bg-red-600 hover:bg-red-700'
                      disabled={deleteProgramMutation.isPending}
                    >
                      {deleteProgramMutation.isPending
                        ? 'Menghapus...'
                        : 'Hapus'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Upload Dialog */}
      <AlertDialog open={isEditingImage} onOpenChange={setIsEditingImage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Gambar Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih gambar baru untuk banner program ini.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='space-y-4'>
            {/* Upload Area */}
            <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6'>
              <Label htmlFor='image-upload' className='cursor-pointer block'>
                <div className='text-center space-y-2'>
                  <svg
                    className='w-12 h-12 mx-auto text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                    />
                  </svg>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    <span className='font-medium'>Klik untuk upload</span> atau
                    drag & drop
                  </div>
                  <p className='text-xs text-gray-500'>
                    PNG, JPG, WEBP, GIF hingga 5MB
                  </p>
                </div>
              </Label>
              <Input
                id='image-upload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                disabled={uploading}
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Mengupload gambar...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className='w-full' />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={uploading}>Batal</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
