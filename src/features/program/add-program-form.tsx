import { getImageUrl } from '@/utils/image-url';
import { ClickableImage } from '@/components/shared/image-preview';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { trpcClient, queryClient } from '@/utils/trpc';
import { ChevronLeft, X, Image as ImageIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const addProgramSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Judul program harus diisi.' })
    .min(3, { message: 'Judul program minimal 3 karakter.' })
    .max(100, { message: 'Judul program maksimal 100 karakter.' }),
  description: z
    .string()
    .min(1, { message: 'Deskripsi program harus diisi.' })
    .min(10, { message: 'Deskripsi program minimal 10 karakter.' })
    .max(500, { message: 'Deskripsi program maksimal 500 karakter.' }),
  targetAmount: z
    .string()
    .min(1, { message: 'Target dana harus diisi.' })
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Target dana harus berupa angka yang valid dan lebih dari 0.',
    }),
  category: z
    .string()
    .min(1, { message: 'Kategori program harus diisi.' })
    .min(2, { message: 'Kategori program minimal 2 karakter.' })
    .max(50, { message: 'Kategori program maksimal 50 karakter.' }),
  bannerImage: z
    .string()
    .min(1, 'Format URL tidak valid')
    .optional()
    .or(z.literal('')),
  contact: z.string().optional(),
  details: z.string().optional(),
});

export type AddProgramFormValues = z.infer<typeof addProgramSchema>;

export default function AddProgramForm() {
  const router = useRouter();
  const [newCategory, setNewCategory] = React.useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const form = useForm<AddProgramFormValues>({
    resolver: zodResolver(addProgramSchema),
    defaultValues: {
      title: '',
      description: '',
      targetAmount: '',
      category: '',
      bannerImage: '',
      contact: '',
      details: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const description = form.watch('description');

  const onSubmitForm = async (formValues: AddProgramFormValues) => {
    try {
      const programData = {
        title: formValues.title,
        description: formValues.description,
        targetAmount: Number(formValues.targetAmount),
        category: formValues.category,
        bannerImage: formValues.bannerImage || '',
        contact: formValues.contact || '',
        details: formValues.details || '',
        status: 'draft' as const,
      };

      await trpcClient.program.create.mutate(programData);

      toast.success('Program berhasil dibuat!');
      await queryClient.invalidateQueries({ queryKey: ['programs'] });
      router.push('/admin/program');
    } catch (error) {
      console.error('Error creating program:', error);
      toast.error('Gagal membuat program. Silakan coba lagi.');
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'new') {
      setShowNewCategoryInput(true);
      form.setValue('category', '');
    } else {
      setShowNewCategoryInput(false);
      form.setValue('category', value);
    }
  };

  const handleNewCategorySubmit = () => {
    if (newCategory.trim()) {
      form.setValue('category', newCategory.trim());
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

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
        throw new Error('Upload failed');
      }

      const result = await response.json();
      form.setValue('bannerImage', result.url);
      toast.success('Gambar berhasil diupload!');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error('Gagal mengupload gambar. Silakan coba lagi.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
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

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Header */}
        <div className='flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='p-2 flex-shrink-0'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='min-w-0 flex-1'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate'>
              Tambah Program Baru
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
              Buat program donasi baru untuk komunitas
            </p>
          </div>
        </div>

        {/* Form */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
          <Form {...form}>
            <form
              className='space-y-6'
              onSubmit={form.handleSubmit(onSubmitForm)}
            >
              {/* Basic Information */}
              <div className='space-y-5'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Informasi Dasar
                </h2>

                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Program *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Masukkan judul program'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Program *</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder='Deskripsikan program secara detail...'
                          className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
                          {...field}
                        />
                      </FormControl>
                      <div className='text-xs text-gray-500'>
                        {description.length}/500 karakter
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='targetAmount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Dana (Rupiah) *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Masukkan target dana'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori Program *</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <Select
                            value={field.value}
                            onValueChange={handleCategoryChange}
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
                                onClick={handleNewCategorySubmit}
                                size='sm'
                              >
                                Tambah
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bannerImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Program (Opsional)</FormLabel>
                      <FormControl>
                        <div className='space-y-4'>
                          {field.value ? (
                            <div className='relative aspect-square overflow-hidden rounded-lg border'>
                              <ClickableImage
                                src={getImageUrl(field.value)}
                                alt='Banner preview'
                                className='w-full h-full object-cover'
                              />
                              <Button
                                type='button'
                                variant='destructive'
                                size='sm'
                                className='absolute top-2 right-2 z-10'
                                onClick={e => {
                                  e.stopPropagation();
                                  field.onChange('');
                                }}
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          ) : (
                            <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center'>
                              <ImageIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                              <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                                Upload banner program
                              </p>
                              <input
                                type='file'
                                accept='image/*'
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file);
                                }}
                                className='hidden'
                                id='banner-upload'
                              />
                              <label
                                htmlFor='banner-upload'
                                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer'
                              >
                                Pilih Gambar
                              </label>
                              {uploading && (
                                <div className='mt-2'>
                                  <div className='text-xs text-gray-500'>
                                    Uploading... {uploadProgress}%
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contact'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontak (Opsional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Nomor telepon atau email kontak'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='details'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detail Program (Opsional)</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder='Detail tambahan tentang program...'
                          className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type='submit'
                className='w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors'
                disabled={form.formState.isSubmitting}
                loading={form.formState.isSubmitting}
              >
                Simpan Program
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
