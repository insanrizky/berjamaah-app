'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import SearchableSelect from '@/components/ui/searchable-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

import { BankAccount, BankAccountFormData } from './types';

interface BankAccountFormProps {
  account?: BankAccount;
  onSubmit: (data: BankAccountFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BANK_OPTIONS = [
  'BCA Digital (blu)',
  'Bank Aladin Syariah',
  'Bank BTPN (Jenius)',
  'Bank Central Asia (BCA)',
  'Bank CIMB Niaga',
  'Bank Danamon',
  'Bank DKI',
  'Bank Index Selindo',
  'Bank Jago',
  'Bank Jabar Banten (BJB)',
  'Bank Jatim',
  'Bank Kalbar',
  'Bank Kalsel',
  'Bank Mandiri',
  'Bank Mayapada',
  'Bank Mega',
  'Bank Mega Syariah',
  'Bank Mestika Dharma',
  'Bank Muamalat Indonesia',
  'Bank Nagari (Sumbar)',
  'Bank Negara Indonesia (BNI)',
  'Bank Neo Commerce (BNC)',
  'Bank NTB Syariah',
  'Bank Panin',
  'Bank Panin Dubai Syariah',
  'Bank Papua',
  'Bank Permata',
  'Bank Raya Indonesia',
  'Bank Rakyat Indonesia (BRI)',
  'Bank Sinarmas',
  'Bank Sulselbar',
  'Bank Sumut',
  'Bank Syariah Indonesia (BSI)',
  'Bank Tabungan Negara (BTN)',
  'Bank Victoria Syariah',
  'Bank Woori Saudara Indonesia',
  'CIMB Niaga',
  'KB Bukopin',
  'Maybank Indonesia',
  'OCBC NISP',
  'SeaBank Indonesia',
];

export default function BankAccountForm({
  account,
  onSubmit,
  onCancel,
  isLoading = false,
}: BankAccountFormProps) {
  const [formData, setFormData] = useState<BankAccountFormData>({
    bankName: account?.bankName || '',
    accountNumber: account?.accountNumber || '',
    accountHolder: account?.accountHolder || '',
    isDefault: account?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Nama bank harus diisi';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Nomor rekening harus diisi';
    } else if (!/^\d+$/.test(formData.accountNumber.trim())) {
      newErrors.accountNumber = 'Nomor rekening harus berupa angka';
    }

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Nama pemilik rekening harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className='border border-gray-200 dark:border-gray-700 shadow-sm'>
      <CardHeader>
        <CardTitle className='text-base flex items-center gap-2'>
          <CreditCard className='w-5 h-5 text-blue-600' />
          {account ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='bankName'>Nama Bank</Label>
            <SearchableSelect
              options={BANK_OPTIONS}
              value={formData.bankName}
              onValueChange={value => handleInputChange('bankName', value)}
              placeholder='Pilih Bank'
              className={errors.bankName ? 'border-red-500' : ''}
            />
            {errors.bankName && (
              <p className='text-sm text-red-600 dark:text-red-400'>
                {errors.bankName}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='accountNumber'>Nomor Rekening</Label>
            <Input
              id='accountNumber'
              type='text'
              value={formData.accountNumber}
              onChange={e => handleInputChange('accountNumber', e.target.value)}
              placeholder='Masukkan nomor rekening'
              className={errors.accountNumber ? 'border-red-500' : ''}
            />
            {errors.accountNumber && (
              <p className='text-sm text-red-600 dark:text-red-400'>
                {errors.accountNumber}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='accountHolder'>Nama Pemilik Rekening</Label>
            <Input
              id='accountHolder'
              type='text'
              value={formData.accountHolder}
              onChange={e => handleInputChange('accountHolder', e.target.value)}
              placeholder='Masukkan nama pemilik rekening'
              className={errors.accountHolder ? 'border-red-500' : ''}
            />
            {errors.accountHolder && (
              <p className='text-sm text-red-600 dark:text-red-400'>
                {errors.accountHolder}
              </p>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='isDefault'
              checked={formData.isDefault}
              onCheckedChange={checked =>
                handleInputChange('isDefault', checked as boolean)
              }
            />
            <Label htmlFor='isDefault' className='text-sm'>
              Jadikan rekening utama
            </Label>
          </div>

          <div className='flex space-x-2 pt-4'>
            <Button type='submit' disabled={isLoading} className='flex-1'>
              {isLoading ? 'Menyimpan...' : account ? 'Update' : 'Simpan'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isLoading}
              className='flex-1'
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
