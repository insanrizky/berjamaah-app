'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import Image from 'next/image';
import { getImageUrl } from '@/utils/image-url';
import { ClickableImage } from '@/components/shared/image-preview';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Target,
  Calendar,
  HandCoins,
  CreditCard,
  Smartphone,
  QrCode,
  Upload,
  ArrowLeft,
  CheckCircle,
  Copy,
  Info,
  X,
  Building2,
  User,
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { formatPeriodText } from '@/lib/period-utils';
import SearchableSelect from '@/components/ui/searchable-select';

const BANK_OPTIONS = [
  'BCA Digital (blu)',
  'Bank Aladin Syariah',
  'Bank BTPN (Jenius)',
  'Bank BRI',
  'Bank BSI (Bank Syariah Indonesia)',
  'Bank BTN',
  'Bank CIMB Niaga',
  'Bank Danamon',
  'Bank DBS Indonesia',
  'Bank HSBC Indonesia',
  'Bank Jateng',
  'Bank Jatim',
  'Bank Kalbar',
  'Bank Kaltim',
  'Bank Mandiri',
  'Bank Maybank Indonesia',
  'Bank Mega',
  'Bank Muamalat',
  'Bank OCBC NISP',
  'Bank Panin',
  'Bank Permata',
  'Bank Rakyat Indonesia (BRI)',
  'Bank Sinarmas',
  'Bank Standard Chartered',
  'Bank UOB Indonesia',
  'Bank Woori Saudara',
  'BCA (Bank Central Asia)',
  'BNI (Bank Negara Indonesia)',
  'BNI Syariah',
  'BRI Syariah',
  'CIMB Niaga Syariah',
  'Danamon Syariah',
  'DBS Bank',
  'HSBC Bank',
  'Maybank Syariah',
  'OCBC NISP Syariah',
  'Panin Bank Syariah',
  'Permata Bank Syariah',
  'Standard Chartered Bank',
  'UOB Bank',
  'Woori Saudara Bank',
  'Bank Aceh',
  'Bank Bengkulu',
  'Bank DKI',
  'Bank Lampung',
  'Bank Maluku',
  'Bank NTT',
  'Bank Papua',
  'Bank Riau',
  'Bank Sulsel',
  'Bank Sulteng',
  'Bank Sultra',
  'Bank Sumsel',
  'Bank Sumut',
  'Bank Yogyakarta',
  'Bank Jago',
];

interface Program {
  id: string;
  title: string;
  description: string;
  target: number;
  collected: number;
  progress: number;
  period: string;
  category: string;
  startDate?: string | null;
  endDate?: string | null;
  totalRaisedAmount?: number;
  progressPercentage?: number;
}

interface DonationDrawerProps {
  program: Program | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programId: string, amount: string) => void;
}

type WizardStep = 'amount' | 'payment' | 'upload' | 'success';

export function DonationDrawer({
  program,
  isOpen,
  onClose,
  onSubmit,
}: DonationDrawerProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('bank_transfer');
  const [selectedBank, setSelectedBank] = useState<string>(
    'Bank Syariah Indonesia'
  );
  const [selectedDigitalWallet, setSelectedDigitalWallet] =
    useState<string>('');
  // Single preview mode; no list of files
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    string | null
  >(null);
  const [saveBankAccount, setSaveBankAccount] = useState(false);
  const utils = trpc.useContext();
  const createDonation = trpc.donation.createDonation.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });
  const { data: profileData } = trpc.user.getProfile.useQuery();
  const { data: savedBankAccounts } = trpc.user.getBankAccounts.useQuery();

  const donationSchema = useMemo(
    () =>
      z
        .object({
          amount: z
            .string()
            .min(1, { message: 'Jumlah donasi wajib diisi' })
            .refine(v => !isNaN(Number(v)) && Number(v) > 0, {
              message: 'Jumlah tidak valid',
            }),
          paymentMethod: z.enum(['bank_transfer', 'digital_wallet', 'qris']),
          senderBankName: z.string().optional(),
          senderAccountNumber: z.string().optional(),
          senderAccountHolder: z.string().optional(),
          transferDate: z.string().optional(),
          donationProofImage: z
            .string()
            .optional()
            .refine(
              val => {
                // Always pass validation for now - server uploads should be trusted
                if (!val || val.trim() === '') {
                  return true;
                }
                return true; // Trust server uploads
              },
              {
                message: 'URL bukti tidak valid',
              }
            ),
        })
        .superRefine((data, ctx) => {
          if (data.paymentMethod === 'bank_transfer') {
            if (!selectedBank) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Pilih bank tujuan',
                path: ['paymentMethod'],
              });
            }
            // Only validate if no saved account is selected
            if (!selectedBankAccountId) {
              if (!data.senderBankName || data.senderBankName.trim() === '') {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Nama bank pengirim wajib diisi',
                  path: ['senderBankName'],
                });
              }
              if (
                !data.senderAccountNumber ||
                data.senderAccountNumber.trim() === ''
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Nomor rekening pengirim wajib diisi',
                  path: ['senderAccountNumber'],
                });
              }
              if (
                !data.senderAccountHolder ||
                data.senderAccountHolder.trim() === ''
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Nama pemilik rekening wajib diisi',
                  path: ['senderAccountHolder'],
                });
              }
            }
          }
          if (
            data.paymentMethod === 'digital_wallet' &&
            !selectedDigitalWallet
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Pilih dompet digital',
              path: ['paymentMethod'],
            });
          }
        }),
    [selectedBank, selectedDigitalWallet, selectedBankAccountId]
  );

  type DonationFormValues = z.infer<typeof donationSchema>;
  const methods = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: '',
      paymentMethod: 'bank_transfer',
      senderBankName: '',
      senderAccountNumber: '',
      senderAccountHolder: '',
      transferDate: '',
      donationProofImage: '',
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState,
    clearErrors,
    getValues,
  } = methods;

  useEffect(() => {
    if (donationAmount) setValue('amount', donationAmount);
  }, [donationAmount, setValue]);

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount.toString());
  };

  const handleAmountSubmit = () => {
    if (!donationAmount || !program) return;
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = () => {
    if (!selectedPaymentMethod) return;

    // Validate specific payment method selections
    if (selectedPaymentMethod === 'bank_transfer') {
      if (!selectedBank) {
        return;
      }

      // Only validate bank details if no saved account is selected
      if (!selectedBankAccountId) {
        const bankName = getValues('senderBankName');
        const accountNumber = getValues('senderAccountNumber');
        const accountHolder = getValues('senderAccountHolder');
        if (
          !bankName ||
          bankName.trim() === '' ||
          !accountNumber ||
          accountNumber.trim() === '' ||
          !accountHolder ||
          accountHolder.trim() === ''
        ) {
          // trigger validation messages to show
          setValue('senderBankName', bankName || '', { shouldValidate: true });
          setValue('senderAccountNumber', accountNumber || '', {
            shouldValidate: true,
          });
          setValue('senderAccountHolder', accountHolder || '', {
            shouldValidate: true,
          });
          return;
        }
      }
    }
    if (selectedPaymentMethod === 'digital_wallet' && !selectedDigitalWallet)
      return;

    setValue(
      'paymentMethod',
      selectedPaymentMethod as 'bank_transfer' | 'digital_wallet' | 'qris',
      {
        shouldValidate: true,
      }
    );
    setCurrentStep('upload');
  };

  const handleSelectSavedBankAccount = (accountId: string) => {
    const account = savedBankAccounts?.find(
      (acc: {
        id: string;
        bankName: string;
        accountNumber: string;
        accountHolder: string;
      }) => acc.id === accountId
    );
    if (account) {
      setValue('senderBankName', account.bankName, { shouldValidate: true });
      setValue('senderAccountNumber', account.accountNumber, {
        shouldValidate: true,
      });
      setValue('senderAccountHolder', account.accountHolder, {
        shouldValidate: true,
      });
      setSelectedBankAccountId(accountId);
      clearErrors([
        'senderBankName',
        'senderAccountNumber',
        'senderAccountHolder',
      ]);
    }
  };

  const handleClearBankAccountSelection = () => {
    setSelectedBankAccountId(null);
    setValue('senderBankName', '', { shouldValidate: true });
    setValue('senderAccountNumber', '', { shouldValidate: true });
    setValue('senderAccountHolder', '', { shouldValidate: true });
  };
  const handleDonationSubmit = async (values: DonationFormValues) => {
    if (!program) return;

    const donationData = {
      programId: program.id,
      amount: Number(values.amount) * 1000,
      donorName: profileData?.fullName || '',
      donorEmail: profileData?.email || '',
      donorPhone: profileData?.phone || '',
      paymentMethod: values.paymentMethod,
      userBankAccountId: selectedBankAccountId || undefined,
      senderBankName: values.senderBankName,
      senderAccountNumber: values.senderAccountNumber,
      senderAccountHolder: values.senderAccountHolder,
      saveBankAccount: saveBankAccount,
      donationProofImage: proofUrl || values.donationProofImage || undefined, // Use proofUrl if available, undefined if empty
      // transferDate left optional
    };

    try {
      await createDonation.mutateAsync(donationData);
      onSubmit(program.id, values.amount);
      setCurrentStep('success');
    } catch (error) {
      console.error('Donation submission failed:', error); // Debug log
      // You might want to show an error message to the user here
      throw error; // Re-throw to let the UI handle it
    }
  };

  const handleClose = () => {
    // Reset all state
    setDonationAmount('');
    setCurrentStep('amount');
    setSelectedPaymentMethod('bank_transfer');
    setSelectedBank('Bank Syariah Indonesia');
    setSelectedDigitalWallet('');
    setUploadedFileName('');
    setProofUrl('');
    setSelectedBankAccountId(null);
    setSaveBankAccount(false);
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('amount');
    } else if (currentStep === 'upload') {
      setCurrentStep('payment');
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const file = files[0];
    setUploadedFileName(file.name);
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'donations');
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

        setProofUrl(data.url);
        // Set the value and clear errors without triggering immediate validation
        setValue('donationProofImage', data.url, { shouldValidate: false });
        clearErrors('donationProofImage');
        // Don't trigger validation for uploaded images - they should be valid
      } else {
        console.error('Upload failed:', resp.status, resp.statusText);
      }
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  // no removeFile list; removal handled by X button on preview

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPaymentMethod);
  };

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Transfer ke rekening bank',
      icon: CreditCard,
      banks: [
        {
          name: 'Bank Syariah Indonesia',
          account: '4442344440 ',
          holder: 'a.n Alfatih Pilar Peradaban',
        },
      ],
    },
    {
      id: 'digital_wallet',
      name: 'Dompet Digital',
      description: 'GoPay, OVO, DANA, LinkAja',
      icon: Smartphone,
      wallets: [
        { name: 'GoPay', number: '081234567890' },
        { name: 'OVO', number: '081234567890' },
        { name: 'DANA', number: '081234567890' },
        { name: 'LinkAja', number: '081234567890' },
      ],
    },
    {
      id: 'qris',
      name: 'QRIS',
      description: 'Scan QR Code untuk pembayaran',
      icon: QrCode,
      qrCode:
        'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=berjamaah-donation-qr',
    },
  ];

  if (!program) return null;

  const enableBackButton = ['amount', 'success'].includes(currentStep);
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleDonationSubmit)} id='donation-form'>
        <Drawer open={isOpen} onOpenChange={handleClose}>
          <DrawerContent>
            <DrawerHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {!enableBackButton && (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleBack}
                      className='h-8 w-8'
                    >
                      <ArrowLeft className='h-4 w-4' />
                    </Button>
                  )}
                  <div>
                    <DrawerTitle className='text-lg font-semibold'>
                      {currentStep === 'amount' && program.title}
                      {currentStep === 'payment' && 'Pilih Metode Pembayaran'}
                      {currentStep === 'upload' && 'Upload Bukti Transaksi'}
                      {currentStep === 'success' && 'Donasi Berhasil!'}
                    </DrawerTitle>
                    {currentStep === 'amount' && (
                      <DrawerDescription className='mt-1'>
                        {program.description}
                      </DrawerDescription>
                    )}
                  </div>
                </div>
              </div>
            </DrawerHeader>

            <div className='px-4 pb-4 space-y-6 overflow-auto'>
              {/* Step 1: Amount Selection */}
              {currentStep === 'amount' && (
                <>
                  {/* Program Details */}
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                      <Target className='w-4 h-4' />
                      <span>
                        Target Rp {program.target.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                      <Calendar className='w-4 h-4' />
                      <span>
                        {formatPeriodText(program.startDate, program.endDate)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className='space-y-2'>
                      <Progress
                        value={program.progressPercentage}
                        className='h-2'
                      />
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Terkumpul Rp{' '}
                          {program.totalRaisedAmount?.toLocaleString('id-ID')}
                        </span>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          {program.progressPercentage?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Donation Amount */}
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='amount' className='text-base font-medium'>
                        Jumlah Donasi (Ribu Rupiah)
                      </Label>
                      <Input
                        id='amount'
                        type='number'
                        placeholder='Masukkan jumlah donasi'
                        value={donationAmount}
                        onChange={e => setDonationAmount(e.target.value)}
                        className='mt-2'
                      />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div>
                      <Label className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        Pilih Jumlah Cepat
                      </Label>
                      <div className='grid grid-cols-4 gap-2 mt-2'>
                        {[25, 50, 75, 100, 125, 150, 175, 200].map(amount => (
                          <Button
                            key={amount}
                            variant={
                              donationAmount === amount.toString()
                                ? 'default'
                                : 'outline'
                            }
                            size='sm'
                            onClick={() => handleAmountSelect(amount)}
                            className='text-xs'
                          >
                            {amount}K
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Donation Summary */}
                    <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Total Donasi:
                        </span>
                        <span className='font-semibold text-lg'>
                          {!donationAmount && '~'}
                          {donationAmount && (
                            <>
                              Rp{' '}
                              {(parseInt(donationAmount) * 1000).toLocaleString(
                                'id-ID'
                              )}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Payment Method Selection */}
              {currentStep === 'payment' && (
                <div className='space-y-4'>
                  {/* <div className='text-sm text-gray-600 dark:text-gray-400'>
                    Pilih metode pembayaran yang Anda inginkan
                  </div> */}

                  {/* <div className='grid grid-cols-3 gap-3'>
                    {paymentMethods.map(method => (
                      <Card
                        key={method.id}
                        className={`cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <CardContent className='p-4 text-center'>
                          <div className='flex flex-col items-center gap-2'>
                            <method.icon className='w-8 h-8 text-blue-600' />
                            <div className='space-y-1'>
                              <h3 className='font-medium text-sm'>
                                {method.name}
                              </h3>
                            </div>
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle className='w-4 h-4 text-blue-600' />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div> */}

                  {/* Bank Transfer Details */}
                  {selectedPaymentMethod === 'bank_transfer' && (
                    <div className='space-y-4'>
                      {/* Bank Selection */}
                      <div className='space-y-3'>
                        <Label className='text-sm font-medium text-gray-900 dark:text-white'>
                          Pilih Bank Tujuan
                        </Label>
                        <div className='grid grid-cols-1 gap-2'>
                          {getSelectedPaymentMethod()?.banks?.map(
                            (bank, index) => (
                              <div
                                key={index}
                                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                  selectedBank === bank.name
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950 ring-2 ring-green-200 dark:ring-green-800'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                                }`}
                                onClick={() => setSelectedBank(bank.name)}
                              >
                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-3'>
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        selectedBank === bank.name
                                          ? 'bg-green-100 dark:bg-green-900'
                                          : 'bg-gray-100 dark:bg-gray-800'
                                      }`}
                                    >
                                      <Building2
                                        className={`w-4 h-4 ${
                                          selectedBank === bank.name
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <p
                                        className={`font-medium ${
                                          selectedBank === bank.name
                                            ? 'text-green-900 dark:text-green-100'
                                            : 'text-gray-900 dark:text-white'
                                        }`}
                                      >
                                        {bank.name}
                                      </p>
                                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                                        {bank.holder}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedBank === bank.name && (
                                    <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Bank Account Information */}
                      {selectedBank && (
                        <Card className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800'>
                          <CardContent className='p-4'>
                            <div className='flex items-center gap-2 mb-4'>
                              <div className='w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
                                <Building2 className='w-4 h-4 text-green-600 dark:text-green-400' />
                              </div>
                              <h4 className='font-semibold text-green-800 dark:text-green-200'>
                                Informasi Rekening Tujuan
                              </h4>
                            </div>

                            {getSelectedPaymentMethod()
                              ?.banks?.filter(
                                bank => bank.name === selectedBank
                              )
                              .map((bank, index) => (
                                <div key={index} className='space-y-3'>
                                  <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-1'>
                                      <Label className='text-xs text-gray-500 dark:text-gray-400'>
                                        Bank
                                      </Label>
                                      <p className='font-medium text-gray-900 dark:text-white'>
                                        {bank.name}
                                      </p>
                                    </div>
                                    <div className='space-y-1'>
                                      <Label className='text-xs text-gray-500 dark:text-gray-400'>
                                        Atas Nama
                                      </Label>
                                      <p className='font-medium text-gray-900 dark:text-white'>
                                        {bank.holder}
                                      </p>
                                    </div>
                                  </div>

                                  <div className='space-y-1'>
                                    <Label className='text-xs text-gray-500 dark:text-gray-400'>
                                      Nomor Rekening
                                    </Label>
                                    <div className='flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
                                      <span className='font-mono font-medium text-lg flex-1'>
                                        {bank.account}
                                      </span>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                          copyToClipboard(bank.account)
                                        }
                                        className='h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-950'
                                      >
                                        <Copy className='w-4 h-4' />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className='p-3 bg-green-100 dark:bg-green-900 rounded-lg'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-sm text-green-800 dark:text-green-200'>
                                        Jumlah Transfer
                                      </span>
                                      <span className='font-bold text-lg text-green-600 dark:text-green-400'>
                                        Rp{' '}
                                        {(
                                          parseInt(donationAmount) * 1000
                                        ).toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Sender Account Information */}
                      {selectedBank && (
                        <Card className='border-gray-200 dark:border-gray-700'>
                          <CardContent className='p-4'>
                            <div className='flex items-center gap-2 mb-4'>
                              <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
                                <User className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                              </div>
                              <h4 className='font-semibold text-gray-900 dark:text-white'>
                                Informasi Rekening Pengirim
                              </h4>
                            </div>

                            {/* Saved Bank Accounts */}
                            {savedBankAccounts &&
                              savedBankAccounts.length > 0 && (
                                <div className='space-y-3 mb-4'>
                                  <Label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                    Gunakan Rekening Tersimpan
                                  </Label>
                                  <div className='space-y-2'>
                                    {savedBankAccounts.map(
                                      (account: {
                                        id: string;
                                        bankName: string;
                                        accountNumber: string;
                                        accountHolder: string;
                                      }) => (
                                        <div
                                          key={account.id}
                                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                            selectedBankAccountId === account.id
                                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-200 dark:ring-blue-800'
                                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                          }`}
                                          onClick={() =>
                                            handleSelectSavedBankAccount(
                                              account.id
                                            )
                                          }
                                        >
                                          <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-3'>
                                              <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                  selectedBankAccountId ===
                                                  account.id
                                                    ? 'bg-blue-100 dark:bg-blue-900'
                                                    : 'bg-gray-100 dark:bg-gray-800'
                                                }`}
                                              >
                                                <Building2
                                                  className={`w-4 h-4 ${
                                                    selectedBankAccountId ===
                                                    account.id
                                                      ? 'text-blue-600 dark:text-blue-400'
                                                      : 'text-gray-600 dark:text-gray-400'
                                                  }`}
                                                />
                                              </div>
                                              <div>
                                                <p
                                                  className={`font-medium ${
                                                    selectedBankAccountId ===
                                                    account.id
                                                      ? 'text-blue-900 dark:text-blue-100'
                                                      : 'text-gray-900 dark:text-white'
                                                  }`}
                                                >
                                                  {account.bankName}
                                                </p>
                                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                                  {account.accountNumber} -{' '}
                                                  {account.accountHolder}
                                                </p>
                                              </div>
                                            </div>
                                            {selectedBankAccountId ===
                                              account.id && (
                                              <CheckCircle className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  {selectedBankAccountId && (
                                    <Button
                                      type='button'
                                      variant='outline'
                                      size='sm'
                                      onClick={handleClearBankAccountSelection}
                                      className='w-full text-sm'
                                    >
                                      Gunakan Rekening Baru
                                    </Button>
                                  )}
                                </div>
                              )}

                            {/* Manual Entry Fields */}
                            {(!selectedBankAccountId ||
                              !savedBankAccounts ||
                              savedBankAccounts.length === 0) && (
                              <div className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <div className='space-y-2'>
                                    <Label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                      Nama Bank
                                    </Label>
                                    <SearchableSelect
                                      options={BANK_OPTIONS}
                                      value={watch('senderBankName') || ''}
                                      onValueChange={value =>
                                        setValue('senderBankName', value, {
                                          shouldValidate: true,
                                        })
                                      }
                                      placeholder='Pilih Bank'
                                      className={
                                        formState.errors.senderBankName
                                          ? 'border-red-500'
                                          : ''
                                      }
                                    />
                                    {formState.errors.senderBankName && (
                                      <p className='text-xs text-red-500'>
                                        {
                                          formState.errors.senderBankName
                                            .message
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <div className='space-y-2'>
                                    <Label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                      Nomor Rekening
                                    </Label>
                                    <Input
                                      placeholder='Masukkan nomor rekening'
                                      {...register('senderAccountNumber')}
                                      className='h-10'
                                    />
                                    {formState.errors.senderAccountNumber && (
                                      <p className='text-xs text-red-500'>
                                        {
                                          formState.errors.senderAccountNumber
                                            .message
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                    Nama Pemilik Rekening
                                  </Label>
                                  <Input
                                    placeholder='Nama sesuai rekening'
                                    {...register('senderAccountHolder')}
                                    className='h-10'
                                  />
                                  {formState.errors.senderAccountHolder && (
                                    <p className='text-xs text-red-500'>
                                      {
                                        formState.errors.senderAccountHolder
                                          .message
                                      }
                                    </p>
                                  )}
                                </div>

                                {/* Save Bank Account Checkbox */}
                                <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                                  <input
                                    type='checkbox'
                                    id='saveBankAccount'
                                    checked={saveBankAccount}
                                    onChange={e =>
                                      setSaveBankAccount(e.target.checked)
                                    }
                                    className='h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500'
                                  />
                                  <Label
                                    htmlFor='saveBankAccount'
                                    className='text-sm cursor-pointer text-gray-700 dark:text-gray-300'
                                  >
                                    Simpan rekening ini untuk donasi berikutnya
                                  </Label>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Digital Wallet Details */}
                  {selectedPaymentMethod === 'digital_wallet' && (
                    <div className='space-y-4'>
                      {/* Digital Wallet Selection */}
                      <div className='space-y-3'>
                        <Label className='text-sm font-medium text-gray-900 dark:text-white'>
                          Pilih Dompet Digital
                        </Label>
                        <div className='grid grid-cols-1 gap-2'>
                          {getSelectedPaymentMethod()?.wallets?.map(
                            (wallet, index) => (
                              <div
                                key={index}
                                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                  selectedDigitalWallet === wallet.name
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-200 dark:ring-blue-800'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                }`}
                                onClick={() =>
                                  setSelectedDigitalWallet(wallet.name)
                                }
                              >
                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-3'>
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        selectedDigitalWallet === wallet.name
                                          ? 'bg-blue-100 dark:bg-blue-900'
                                          : 'bg-gray-100 dark:bg-gray-800'
                                      }`}
                                    >
                                      <Smartphone
                                        className={`w-4 h-4 ${
                                          selectedDigitalWallet === wallet.name
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <p
                                        className={`font-medium ${
                                          selectedDigitalWallet === wallet.name
                                            ? 'text-blue-900 dark:text-blue-100'
                                            : 'text-gray-900 dark:text-white'
                                        }`}
                                      >
                                        {wallet.name}
                                      </p>
                                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                                        Dompet Digital
                                      </p>
                                    </div>
                                  </div>
                                  {selectedDigitalWallet === wallet.name && (
                                    <CheckCircle className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Digital Wallet Information */}
                      {selectedDigitalWallet && (
                        <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800'>
                          <CardContent className='p-4'>
                            <div className='flex items-center gap-2 mb-4'>
                              <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
                                <Smartphone className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                              </div>
                              <h4 className='font-semibold text-blue-800 dark:text-blue-200'>
                                Informasi Dompet Digital
                              </h4>
                            </div>

                            {getSelectedPaymentMethod()
                              ?.wallets?.filter(
                                wallet => wallet.name === selectedDigitalWallet
                              )
                              .map((wallet, index) => (
                                <div key={index} className='space-y-3'>
                                  <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-1'>
                                      <Label className='text-xs text-gray-500 dark:text-gray-400'>
                                        Dompet
                                      </Label>
                                      <p className='font-medium text-gray-900 dark:text-white'>
                                        {wallet.name}
                                      </p>
                                    </div>
                                    <div className='space-y-1'>
                                      <Label className='text-xs text-gray-500 dark:text-gray-400'>
                                        Nomor
                                      </Label>
                                      <div className='flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
                                        <span className='font-mono font-medium text-lg flex-1'>
                                          {wallet.number}
                                        </span>
                                        <Button
                                          variant='outline'
                                          size='sm'
                                          onClick={() =>
                                            copyToClipboard(wallet.number)
                                          }
                                          className='h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950'
                                        >
                                          <Copy className='w-4 h-4' />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-sm text-blue-800 dark:text-blue-200'>
                                        Jumlah Transfer
                                      </span>
                                      <span className='font-bold text-lg text-blue-600 dark:text-blue-400'>
                                        Rp{' '}
                                        {(
                                          parseInt(donationAmount) * 1000
                                        ).toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* QRIS Details */}
                  {selectedPaymentMethod === 'qris' && (
                    <div className='space-y-3'>
                      <Alert>
                        <Info className='h-4 w-4' />
                        <AlertDescription>
                          Scan QR Code dengan aplikasi dompet digital Anda
                        </AlertDescription>
                      </Alert>

                      <Card className='bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800'>
                        <CardContent className='p-4 text-center'>
                          <h4 className='font-semibold text-purple-800 dark:text-purple-200 mb-3'>
                            QR Code Pembayaran
                          </h4>
                          <div className='flex justify-center mb-3'>
                            <Image
                              src={getSelectedPaymentMethod()?.qrCode || ''}
                              alt='QR Code Pembayaran'
                              width={192}
                              height={192}
                              className='border rounded-lg'
                            />
                          </div>
                          <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Jumlah:
                              </span>
                              <span className='font-semibold text-purple-600'>
                                Rp{' '}
                                {(
                                  parseInt(donationAmount) * 1000
                                ).toLocaleString('id-ID')}
                              </span>
                            </div>
                            <p className='text-xs text-gray-500'>
                              Scan QR Code dengan aplikasi dompet digital untuk
                              melakukan pembayaran
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Upload Transaction Proof */}
              {currentStep === 'upload' && (
                <div className='space-y-4'>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    Upload bukti transaksi pembayaran Anda
                  </div>

                  {/* Hidden input to ensure form state is managed */}
                  <input type='hidden' {...register('donationProofImage')} />

                  {/* Upload Area with preview (like add program) */}
                  <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center'>
                    {proofUrl ? (
                      <div className='relative'>
                        <ClickableImage
                          src={getImageUrl(proofUrl)}
                          alt='Bukti Donasi'
                          className='w-full object-cover rounded-lg border'
                        />
                        {uploadedFileName && (
                          <div className='absolute bottom-2 left-2 right-10 bg-black/60 text-white text-xs px-2 py-1 rounded truncate'>
                            {uploadedFileName}
                          </div>
                        )}
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          className='absolute top-2 right-2'
                          onClick={() => {
                            setProofUrl('');
                            setUploadedFileName('');
                            setValue('donationProofImage', '', {
                              shouldValidate: true,
                            });
                          }}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ) : (
                      <Label
                        htmlFor='file-upload'
                        className='cursor-pointer flex flex-col items-center space-y-2'
                      >
                        {uploading ? (
                          <div className='flex flex-col items-center space-y-2'>
                            <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                              Mengupload... {uploadProgress}%
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className='h-8 w-8 text-gray-400' />
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              <p className='font-medium'>
                                Klik untuk upload bukti transfer
                              </p>
                              <p>PNG, JPG, WEBP, GIF (max 5MB)</p>
                            </div>
                          </>
                        )}
                        <Input
                          id='file-upload'
                          type='file'
                          accept='image/*'
                          multiple={false}
                          onChange={handleFileUpload}
                          className='hidden'
                          disabled={uploading}
                        />
                      </Label>
                    )}
                    {!proofUrl && (
                      <p className='text-xs text-gray-500 mt-1'>
                        PNG, JPG, JPEG (max 5MB)
                      </p>
                    )}
                  </div>
                  {/* Validation Message */}
                  {formState.errors.donationProofImage && (
                    <p className='text-xs text-red-500'>
                      {formState.errors.donationProofImage.message}
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Success */}
              {currentStep === 'success' && (
                <div className='text-center space-y-4'>
                  <CheckCircle className='w-16 h-16 text-green-500 mx-auto' />
                  <div>
                    <h3 className='text-lg font-semibold text-green-600'>
                      Donasi Berhasil!
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      Terima kasih atas donasi Anda sebesar{' '}
                      <span className='font-semibold'>
                        Rp{' '}
                        {(parseInt(donationAmount) * 1000).toLocaleString(
                          'id-ID'
                        )}
                      </span>
                    </p>
                    <p className='text-xs text-gray-500 mt-2'>
                      Bukti donasi akan diverifikasi dalam 1-2 hari kerja
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='space-y-2'>
                {currentStep === 'amount' && (
                  <>
                    <Button
                      onClick={handleAmountSubmit}
                      disabled={!donationAmount}
                      className='w-full'
                    >
                      <HandCoins className='w-4 h-4 mr-2' />
                      Lanjutkan Donasi
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        variant='outline'
                        className='w-full'
                        onClick={handleClose}
                      >
                        Batal
                      </Button>
                    </DrawerClose>
                  </>
                )}

                {currentStep === 'payment' && (
                  <>
                    <Button
                      onClick={handlePaymentSubmit}
                      disabled={
                        !selectedPaymentMethod ||
                        (selectedPaymentMethod === 'bank_transfer' &&
                          !selectedBank) ||
                        (selectedPaymentMethod === 'digital_wallet' &&
                          !selectedDigitalWallet)
                      }
                      className='w-full'
                    >
                      Lanjutkan
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={handleBack}
                    >
                      Kembali
                    </Button>
                  </>
                )}

                {currentStep === 'upload' && (
                  <>
                    <Button
                      type='submit'
                      form='donation-form'
                      className='w-full'
                      disabled={!proofUrl || createDonation.isPending}
                      loading={createDonation.isPending}
                      onClick={handleSubmit(handleDonationSubmit)}
                    >
                      <HandCoins className='w-4 h-4 mr-2' />
                      Kirim Donasi
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={handleBack}
                    >
                      Kembali
                    </Button>
                  </>
                )}

                {currentStep === 'success' && (
                  <Button onClick={handleClose} className='w-full'>
                    Tutup
                  </Button>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </form>
    </FormProvider>
  );
}
