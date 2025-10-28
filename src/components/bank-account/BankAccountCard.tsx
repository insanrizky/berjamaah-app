'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { CreditCard, Edit, Trash2, Star } from 'lucide-react';
import { useState } from 'react';

import { BankAccount } from './types';

interface BankAccountCardProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (accountId: string) => void;
  onSetDefault: (accountId: string) => void;
}

export default function BankAccountCard({
  account,
  onEdit,
  onDelete,
  onSetDefault,
}: BankAccountCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(account.id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    if (!account.isDefault) {
      await onSetDefault(account.id);
    }
  };

  return (
    <Card className='border border-gray-200 dark:border-gray-700 shadow-sm'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-start space-x-3 flex-1'>
            <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
              <CreditCard className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <h3 className='font-medium text-gray-900 dark:text-white truncate'>
                  {account.bankName}
                </h3>
                {account.isDefault && (
                  <Badge variant='secondary' className='text-xs'>
                    <Star className='w-3 h-3 mr-1' />
                    Utama
                  </Badge>
                )}
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
                {account.accountNumber}
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-500'>
                {account.accountHolder}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-1 ml-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onEdit(account)}
              className='h-8 w-8 p-0'
            >
              <Edit className='w-4 h-4' />
            </Button>
            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={isDeleting}
                  className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Rekening Bank</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus rekening bank{' '}
                    <strong>{account.bankName}</strong> dengan nomor{' '}
                    <strong>{account.accountNumber}</strong>?
                    <br /> <br /> Tindakan ini tidak dapat dibatalkan dan akan
                    menghapus rekening dari daftar Anda.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className='bg-red-600 hover:bg-red-700'
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Menghapus...' : 'Hapus'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {!account.isDefault && (
          <div className='mt-3 pt-3 border-t border-gray-100 dark:border-gray-700'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleSetDefault}
              className='w-full text-xs'
            >
              <Star className='w-3 h-3 mr-1' />
              Jadikan Rekening Utama
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
