'use client';

import { useCallback, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { trpcClient } from '@/utils/trpc';
import {
  ListCard,
  ListCardContent,
  CardDataTitle,
  CardDataDescription,
  CardDataTimestamp,
} from '@/components/shared/list-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertCircle,
  User,
  MoreHorizontal,
  UserPlus,
  Send,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Banknote,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

// Types for user data
interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalDonations?: number;
  totalAmount?: number;
}

interface UserResponse {
  users: User[];
  hasMore: boolean;
}

interface UserListCardProps {
  search?: string;
  status?: 'all' | 'scheduled' | 'pending' | 'active';
  role?: 'all' | 'admin' | 'user';
  className?: string;
}

export function UserListCard({
  search,
  status = 'all',
  role = 'all',
  className,
}: UserListCardProps) {
  const limit = 10;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [isResendingActivation, setIsResendingActivation] = useState(false);

  const { data: session } = useSession();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<UserResponse>({
      queryKey: ['users', search, status, role, limit],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        return await trpcClient.user.getAllUsers.query({
          page:
            Math.floor(
              (typeof pageParam === 'number' ? pageParam : 0) / limit
            ) + 1,
          limit,
          search: search || undefined,
          status: status || 'all',
          role: role || 'all',
        });
      },
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.hasMore) return undefined;
        const loaded = allPages.reduce(
          (sum, p) => sum + (p?.users?.length ?? 0),
          0
        );
        return loaded;
      },
    });

  // Get all users from all pages
  const users: User[] = data?.pages.flatMap(page => page?.users ?? []) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && users.length > 0) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, users.length]);

  // Admin action handlers
  const handleMakeAdmin = async (user: User) => {
    try {
      await trpcClient.user.updateUserRole.mutate({
        userId: user.id,
        role: 'admin',
      });
      toast.success('Role pengguna berhasil diperbarui');
      // Invalidate queries to refresh data
      window.location.reload(); // Simple refresh for now
    } catch {
      toast.error('Gagal memperbarui role pengguna');
    }
  };

  const handleMakeUser = async (user: User) => {
    try {
      await trpcClient.user.updateUserRole.mutate({
        userId: user.id,
        role: 'user',
      });
      toast.success('Role pengguna berhasil diperbarui');
      // Invalidate queries to refresh data
      window.location.reload(); // Simple refresh for now
    } catch {
      toast.error('Gagal memperbarui role pengguna');
    }
  };

  const handleResendActivation = async (user: User) => {
    try {
      setIsResendingActivation(true);
      await trpcClient.user.resendActivationEmail.mutate({
        userId: user.id,
      });
      toast.success('Email aktivasi berhasil dikirim ulang');
    } catch {
      toast.error('Gagal mengirim ulang email aktivasi');
    } finally {
      setIsResendingActivation(false);
    }
  };

  const openAdminDialog = (user: User) => {
    setSelectedUser(user);
    setShowAdminDialog(true);
  };

  const openUserDialog = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const openResendDialog = (user: User) => {
    setSelectedUser(user);
    setShowResendDialog(true);
  };

  // Handle user selection for drawer
  const handleUserSelect = (user: User) => {
    setSelectedUserId(user.id);
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedUserId(null);
    setSelectedUser(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'pending':
        return 'Menunggu';
      case 'scheduled':
        return 'Terjadwal';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'user':
        return 'User';
      default:
        return 'Tidak Diketahui';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={className}>
      <ListCard onLoadMore={users.length > 0 ? handleLoadMore : undefined}>
        <ListCardContent className='px-0'>
          <div className='space-y-3'>
            {users.map(user => (
              <Card
                key={user.id}
                className='py-0 gap-0 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer'
                onClick={() => handleUserSelect(user)}
              >
                <CardContent className='px-4 pt-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <User className='w-4 h-4 text-gray-400' />
                        <CardDataTitle className='text-base font-semibold text-gray-900 dark:text-white truncate'>
                          {user.fullName || user.email}
                        </CardDataTitle>
                      </div>
                      <CardDataDescription className='text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1'>
                        {user.email}
                      </CardDataDescription>
                    </div>

                    <div className='flex flex-col items-end gap-2'>
                      <div className='flex gap-1 items-center'>
                        <Badge
                          variant='secondary'
                          className={`text-xs px-2 py-1 ${getStatusColor(user.status)}`}
                        >
                          {getStatusText(user.status)}
                        </Badge>
                        <Badge variant='outline' className='text-xs px-2 py-1'>
                          {getRoleText(user.role)}
                        </Badge>
                        {/* Admin Actions Dropdown */}
                        {(user.fullName !== 'Admin Berjamaah' ||
                          user.email !== session?.user?.email) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={e => e.stopPropagation()}
                              >
                                <MoreHorizontal className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              {user.role === 'user' ? (
                                <DropdownMenuItem
                                  disabled={user.status !== 'active'}
                                  onClick={() => openAdminDialog(user)}
                                >
                                  <UserPlus className='w-4 h-4 mr-2' />
                                  Jadikan Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => openUserDialog(user)}
                                >
                                  <UserPlus className='w-4 h-4 mr-2' />
                                  Jadikan User
                                </DropdownMenuItem>
                              )}
                              {(user.status === 'pending' ||
                                user.status === 'scheduled') && (
                                <DropdownMenuItem
                                  onClick={() => openResendDialog(user)}
                                >
                                  <Send className='w-4 h-4 mr-2' />
                                  Kirim Ulang Email Aktivasi
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <CardDataTimestamp>
                        {formatDate(user.createdAt)}
                      </CardDataTimestamp>
                    </div>
                  </div>
                </CardContent>
                <CardContent className='px-4 pb-4'>
                  <div className='flex justify-between text-xs text-gray-600 dark:text-gray-400'>
                    <span>Dibuat: {formatDate(user.createdAt)}</span>
                    <span>Donasi: {user.totalDonations || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {isLoading && (
              <div className='text-center text-sm text-gray-500 py-4'>
                Memuat pengguna...
              </div>
            )}

            {!isLoading && users.length === 0 && (
              <div className='text-center py-8'>
                <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-sm text-gray-500'>
                  Belum ada pengguna yang ditemukan
                </p>
              </div>
            )}

            {isFetchingNextPage && (
              <div className='text-center text-sm text-gray-500 py-4'>
                Memuat lebih banyak...
              </div>
            )}
          </div>
        </ListCardContent>
      </ListCard>

      {/* Make Admin Confirmation Dialog */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jadikan Pengguna Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menjadikan{' '}
              <strong>{selectedUser?.fullName || selectedUser?.email}</strong>{' '}
              sebagai admin? Ini akan memberikan mereka hak akses administratif
              penuh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleMakeAdmin(selectedUser)}
            >
              Jadikan Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Make User Confirmation Dialog */}
      <AlertDialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jadikan Admin User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menjadikan{' '}
              <strong>{selectedUser?.fullName || selectedUser?.email}</strong>{' '}
              sebagai user biasa? Ini akan menghapus hak akses administratif
              mereka.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleMakeUser(selectedUser)}
            >
              Jadikan User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resend Activation Email Confirmation Dialog */}
      <AlertDialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim Ulang Email Aktivasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim ulang email aktivasi kepada{' '}
              <strong>{selectedUser?.fullName || selectedUser?.email}</strong>?
              Email aktivasi baru akan dikirim dan token sebelumnya akan
              diganti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResendingActivation}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedUser && handleResendActivation(selectedUser)
              }
              disabled={isResendingActivation}
            >
              {isResendingActivation ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Mengirim...
                </>
              ) : (
                'Kirim Email Aktivasi'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Detail Drawer */}
      {selectedUserId && selectedUser && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
              <DrawerHeader className='flex-shrink-0'>
                <DrawerTitle>Detail Pengguna</DrawerTitle>
                <DrawerDescription>
                  Informasi lengkap tentang pengguna ini
                </DrawerDescription>
              </DrawerHeader>
              <div className='flex-1 px-4 pb-4'>
                {/* Dummy Content */}
                <div className='space-y-6'>
                  {/* User Info Section */}
                  <Card className='gap-0'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm font-medium flex items-center gap-2'>
                        <User className='w-4 h-4' />
                        Informasi Pengguna
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3'>
                          <User className='w-5 h-5 text-gray-400' />
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                              {selectedUser.fullName || 'Nama tidak tersedia'}
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Nama Lengkap
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <Mail className='w-5 h-5 text-gray-400' />
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                              {selectedUser.email}
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Email
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <Phone className='w-5 h-5 text-gray-400' />
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                              {selectedUser.phone || 'Tidak tersedia'}
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Nomor Telepon
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status & Role Section */}
                  <Card className='gap-0'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm font-medium flex items-center gap-2'>
                        <Shield className='w-4 h-4' />
                        Status & Role
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Status
                          </span>
                          <Badge
                            variant='secondary'
                            className={`text-xs px-2 py-1 ${getStatusColor(selectedUser.status)}`}
                          >
                            {getStatusText(selectedUser.status)}
                          </Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Role
                          </span>
                          <Badge
                            variant='outline'
                            className='text-xs px-2 py-1'
                          >
                            {getRoleText(selectedUser.role)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Section */}
                  <Card className='gap-0'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm font-medium flex items-center gap-2'>
                        <Calendar className='w-4 h-4' />
                        Aktivitas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3'>
                          <Calendar className='w-5 h-5 text-gray-400' />
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                              {formatDate(selectedUser.createdAt)}
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Tanggal Bergabung
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <Banknote className='w-5 h-5 text-gray-400' />
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                              {selectedUser.totalDonations || 0} donasi
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Total Donasi
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <Banknote className='w-5 h-5 text-gray-400' />
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                              Rp{' '}
                              {selectedUser.totalAmount?.toLocaleString(
                                'id-ID'
                              ) || '0'}
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Total Nominal Donasi
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin Actions - Only show if not the current user and not main admin */}
                  {(selectedUser.fullName !== 'Admin Berjamaah' ||
                    selectedUser.email !== session?.user?.email) && (
                    <Card className='gap-0'>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium flex items-center gap-2'>
                          <Shield className='w-4 h-4' />
                          Kelola Pengguna
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Role Actions */}
                        <div className='space-y-2 mb-4'>
                          <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                            Ubah Role Pengguna
                          </p>
                          {selectedUser.role === 'user' ? (
                            <Button
                              onClick={() => openAdminDialog(selectedUser)}
                              disabled={selectedUser.status !== 'active'}
                              className='w-full bg-blue-500 hover:bg-blue-600'
                            >
                              <UserPlus className='w-4 h-4 mr-2' />
                              Jadikan Admin
                            </Button>
                          ) : (
                            <Button
                              onClick={() => openUserDialog(selectedUser)}
                              variant='outline'
                              className='w-full'
                            >
                              <UserPlus className='w-4 h-4 mr-2' />
                              Jadikan User
                            </Button>
                          )}
                        </div>

                        {/* Email Actions */}
                        {(selectedUser.status === 'pending' ||
                          selectedUser.status === 'scheduled') && (
                          <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                            <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                              Email Aktivasi
                            </p>
                            <Button
                              onClick={() => openResendDialog(selectedUser)}
                              disabled={isResendingActivation}
                              variant='outline'
                              className='w-full'
                            >
                              <Send className='w-4 h-4 mr-2' />
                              {isResendingActivation
                                ? 'Mengirim...'
                                : 'Kirim Ulang Email Aktivasi'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              <DrawerFooter className='flex-shrink-0'>
                <DrawerClose asChild>
                  <Button variant='outline' onClick={handleDrawerClose}>
                    Tutup
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
