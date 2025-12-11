'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, FileText, Eye, X } from 'lucide-react';
import { trpcClient, queryClient, trpc } from '@/utils/trpc';
import { CreatableMultiSelect } from '@/components/ui/creatable-multi-select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const addReportSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Judul laporan harus diisi.' })
    .min(3, { message: 'Judul laporan minimal 3 karakter.' })
    .max(200, { message: 'Judul laporan maksimal 200 karakter.' }),
  description: z
    .string()
    .max(1000, { message: 'Deskripsi maksimal 1000 karakter.' })
    .optional(),
  tags: z.array(z.string()),
  fileUrl: z.string().min(1, { message: 'File laporan harus diupload.' }),
});

export type AddReportFormValues = z.infer<typeof addReportSchema>;

export default function AddReportPage() {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadedFileName, setUploadedFileName] = React.useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const { data: existingTags = [] } = trpc.report.getTags.useQuery();

  const form = useForm<AddReportFormValues>({
    resolver: zodResolver(addReportSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      fileUrl: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const fileUrl = form.watch('fileUrl');

  const handlePreview = () => {
    if (fileUrl) {
      setIsPreviewOpen(true);
    }
  };

  const onSubmitForm = async (formValues: AddReportFormValues) => {
    try {
      await trpcClient.report.create.mutate({
        title: formValues.title,
        description: formValues.description || undefined,
        tags: formValues.tags,
        fileUrl: formValues.fileUrl,
      });

      toast.success('Laporan berhasil dibuat!');
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
      router.push('/admin/report');
    } catch (error) {
      console.error('Error creating report:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Gagal membuat laporan. Silakan coba lagi.';
      toast.error(errorMessage);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const file = files[0];

    // Validate PDF format
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      toast.error('Hanya file PDF yang diperbolehkan.');
      event.target.value = ''; // Reset file input
      return;
    }

    setUploadedFileName(file.name);
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'reports');

    const progressInterval = setInterval(() => {
      setUploadProgress((prev: number) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (resp.ok) {
        const data = await resp.json();
        form.setValue('fileUrl', data.url, { shouldValidate: true });
        toast.success('File berhasil diupload!');
      } else {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengupload file. Silakan coba lagi.';
      toast.error(errorMessage);
      setUploadedFileName('');
      form.setValue('fileUrl', '');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-1 flex-col gap-6'>
        <div className='flex flex-col gap-4'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='p-2'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Tambah Laporan Baru
              </h1>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Upload dan kelola laporan baru
              </p>
            </div>
          </div>
        </div>

        <div className='flex-1'>
          <Card className='w-full mx-auto'>
            <CardHeader>
              <CardTitle>Informasi Laporan</CardTitle>
              <CardDescription>
                Lengkapi informasi laporan yang ingin Anda tambahkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className='space-y-6'
                  onSubmit={form.handleSubmit(onSubmitForm)}
                >
                  {/* Title Field */}
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Judul Laporan <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Masukkan judul laporan'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Singkat</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Masukkan deskripsi singkat laporan (opsional)'
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tags Field */}
                  <FormField
                    control={form.control}
                    name='tags'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag</FormLabel>
                        <FormControl>
                          <CreatableMultiSelect
                            options={existingTags}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder='Pilih atau buat tag baru...'
                            createText='Buat tag baru'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload Field */}
                  <FormField
                    control={form.control}
                    name='fileUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          File Laporan <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2 w-full min-w-0'>
                              <Input
                                type='file'
                                accept='.pdf,application/pdf'
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className='hidden'
                                id='file-upload'
                              />
                              <label
                                htmlFor='file-upload'
                                className='flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 min-w-0 flex-1 overflow-hidden'
                              >
                                <Upload className='w-4 h-4 flex-shrink-0' />
                                <span
                                  className='truncate'
                                  style={{
                                    minWidth: 0,
                                    flex: '1 1 0%',
                                    width: 0,
                                  }}
                                  title={uploadedFileName || undefined}
                                >
                                  {uploading
                                    ? 'Mengupload...'
                                    : uploadedFileName || 'Pilih File'}
                                </span>
                              </label>
                            </div>
                            {uploading && (
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                  className='bg-green-600 h-2 rounded-full transition-all'
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            )}
                            {fileUrl && !uploading && (
                              <div className='flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md w-full min-w-0'>
                                <FileText className='w-4 h-4 text-green-600 flex-shrink-0' />
                                <span
                                  className='text-sm text-green-700 dark:text-green-400 truncate min-w-0 flex-1'
                                  style={{
                                    minWidth: 0,
                                    flex: '1 1 0%',
                                    width: 0,
                                  }}
                                  title={uploadedFileName || undefined}
                                >
                                  {uploadedFileName || 'File berhasil diupload'}
                                </span>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={handlePreview}
                                  className='h-7 px-3 flex-shrink-0'
                                >
                                  <Eye className='w-3 h-3 mr-1.5' />
                                  Preview
                                </Button>
                              </div>
                            )}
                            <input type='hidden' {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className='flex gap-3 pt-4'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => router.back()}
                      className='flex-1'
                    >
                      Batal
                    </Button>
                    <Button
                      type='submit'
                      loading={form.formState.isSubmitting}
                      disabled={form.formState.isSubmitting || uploading}
                      className='flex-1'
                    >
                      Simpan Laporan
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {fileUrl && (
        <AlertDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <AlertDialogContent className='max-w-5xl max-h-[90vh] p-0 overflow-hidden'>
            <AlertDialogHeader className='p-4 pb-2'>
              <div className='flex items-center justify-between'>
                <AlertDialogTitle className='text-lg font-semibold'>
                  Preview PDF
                </AlertDialogTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsPreviewOpen(false)}
                  className='h-8 w-8 p-0'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </AlertDialogHeader>
            <div className='flex-1 overflow-auto p-4 pt-0'>
              <iframe
                src={fileUrl}
                className='w-full h-[75vh] border border-gray-200 dark:border-gray-700 rounded-lg'
                title={uploadedFileName || 'PDF Preview'}
              />
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
