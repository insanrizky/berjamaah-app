'use client';

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BankAccountForm from './BankAccountForm';
import BankAccountCard from './BankAccountCard';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

import { BankAccount, BankAccountFormData } from './types';

interface BankAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BankAccountDrawer({
  isOpen,
  onClose,
}: BankAccountDrawerProps) {
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    data: bankAccounts,
    isLoading,
    refetch,
  } = trpc.user.getBankAccounts.useQuery();

  const saveBankAccountMutation = trpc.user.saveBankAccount.useMutation({
    onSuccess: () => {
      toast.success('Rekening bank berhasil disimpan');
      refetch();
      setEditingAccount(null);
      setShowForm(false);
    },
    onError: error => {
      toast.error(error.message || 'Gagal menyimpan rekening bank');
    },
  });

  const deleteBankAccountMutation = trpc.user.deleteBankAccount.useMutation({
    onSuccess: () => {
      toast.success('Rekening bank berhasil dihapus');
      refetch();
    },
    onError: error => {
      toast.error(error.message || 'Gagal menghapus rekening bank');
    },
  });

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setShowForm(false);
  };

  const handleSubmitAccount = async (data: BankAccountFormData) => {
    setIsSubmitting(true);
    try {
      await saveBankAccountMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteBankAccountMutation.mutateAsync({ id: accountId });
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    const account = bankAccounts?.find(acc => acc.id === accountId);
    if (account) {
      setIsSubmitting(true);
      try {
        await saveBankAccountMutation.mutateAsync({
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountHolder: account.accountHolder,
          isDefault: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
          <DrawerHeader className='flex-shrink-0'>
            <DrawerTitle>Kelola Rekening Bank</DrawerTitle>
            <DrawerDescription>
              Kelola rekening bank Anda untuk memudahkan proses donasi
            </DrawerDescription>
          </DrawerHeader>

          <div className='flex-1 px-4 pb-4 space-y-4'>
            {!showForm && (
              <div className='flex justify-center'>
                <Button
                  onClick={handleAddAccount}
                  className='flex items-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Tambah Rekening Bank
                </Button>
              </div>
            )}

            {showForm && (
              <BankAccountForm
                account={editingAccount || undefined}
                onSubmit={handleSubmitAccount}
                onCancel={handleCancelEdit}
                isLoading={isSubmitting}
              />
            )}

            {!showForm && (
              <div className='space-y-3'>
                {isLoading ? (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto'></div>
                    <p className='text-sm text-gray-500 mt-2'>
                      Memuat rekening bank...
                    </p>
                  </div>
                ) : bankAccounts && bankAccounts.length > 0 ? (
                  bankAccounts.map(account => (
                    <BankAccountCard
                      key={account.id}
                      account={account}
                      onEdit={handleEditAccount}
                      onDelete={handleDeleteAccount}
                      onSetDefault={handleSetDefault}
                    />
                  ))
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-gray-500 dark:text-gray-400'>
                      Belum ada rekening bank yang tersimpan
                    </p>
                    <p className='text-sm text-gray-400 dark:text-gray-500 mt-1'>
                      Tambah rekening bank untuk memudahkan proses donasi
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='flex-shrink-0 p-4 border-t'>
            <DrawerClose asChild>
              <Button variant='outline' className='w-full'>
                Tutup
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
