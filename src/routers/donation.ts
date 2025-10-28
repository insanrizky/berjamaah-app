import { TRPCError } from '@trpc/server';
import z from 'zod';
import prisma from '../../prisma/index';
import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import { generateDonationReferenceNumber } from '../utils/donation-reference';

export const donationRouter = router({
  getUserDonations: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().optional().default(10),
        offset: z.number().int().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { limit, offset } = input;

        const donations = await prisma.donation.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                bannerImage: true,
                targetAmount: true,
              },
            },
            verifiedByAdmin: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        });

        const totalCount = await prisma.donation.count({
          where: {
            userId: ctx.session.user.id,
          },
        });

        return {
          donations,
          pagination: {
            totalCount,
            hasMore: offset + donations.length < totalCount,
          },
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user donations',
        });
      }
    }),

  getDonationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const donation = await prisma.donation.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                bannerImage: true,
                targetAmount: true,
              },
            },
            verifiedByAdmin: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            userBankAccount: {
              select: {
                id: true,
                bankName: true,
                accountNumber: true,
                accountHolder: true,
              },
            },
          },
        });

        if (!donation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Donation not found',
          });
        }

        return donation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch donation',
        });
      }
    }),

  getPrograms: publicProcedure
    .input(
      z.object({
        status: z.enum(['active', 'completed', 'draft']).optional(),
        limit: z.number().int().positive().optional().default(10),
        offset: z.number().int().min(0).optional().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const { status, limit, offset } = input;

        const where: Record<string, unknown> = {};
        if (status) {
          where.status = status;
        }

        const programs = await prisma.program.findMany({
          where,
          include: {
            donations: {
              where: {
                status: { in: ['verified'] },
              },
              select: {
                amount: true,
                userId: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        });

        return programs.map(program => {
          const totalDonations = program.donations.reduce(
            (sum, donation) => sum + Number(donation.amount),
            0
          );
          const uniqueDonors = new Set(
            program.donations.map(donation => donation.userId)
          ).size;

          return {
            id: program.id,
            title: program.title,
            description: program.description,
            category: program.category,
            bannerImage: program.bannerImage,
            targetAmount: program.targetAmount,
            collectedAmount: totalDonations,
            progress:
              Number(program.targetAmount) > 0
                ? (totalDonations / Number(program.targetAmount)) * 100
                : 0,
            donorCount: uniqueDonors,
            status: program.status,
          };
        });
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch programs',
        });
      }
    }),

  getProgramById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const program = await prisma.program.findFirst({
          where: {
            id: input.id,
            status: 'active',
          },
          include: {
            donations: {
              where: {
                status: { in: ['verified'] },
              },
              select: {
                amount: true,
                userId: true,
                createdAt: true,
              },
            },
          },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found or not active',
          });
        }

        const totalDonations = program.donations.reduce(
          (sum, donation) => sum + Number(donation.amount),
          0
        );
        const uniqueDonors = new Set(
          program.donations.map(donation => donation.userId)
        ).size;

        return {
          id: program.id,
          title: program.title,
          description: program.description,
          category: program.category,
          bannerImage: program.bannerImage,
          targetAmount: program.targetAmount,
          collectedAmount: totalDonations,
          progress:
            Number(program.targetAmount) > 0
              ? (totalDonations / Number(program.targetAmount)) * 100
              : 0,
          donorCount: uniqueDonors,
          status: program.status,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch program',
        });
      }
    }),

  getProgramDonations: publicProcedure
    .input(
      z.object({
        programId: z.string(),
        limit: z.number().int().positive().optional().default(10),
        offset: z.number().int().min(0).optional().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const { programId, limit, offset } = input;

        const donations = await prisma.donation.findMany({
          where: {
            programId,
            status: { in: ['verified'] }, // Only show verified donations
          },
          select: {
            id: true,
            donorName: true,
            amount: true,
            createdAt: true,
            donationReferenceNumber: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        });

        const totalCount = await prisma.donation.count({
          where: {
            programId,
            status: { in: ['verified'] },
          },
        });

        return {
          donations,
          pagination: {
            totalCount,
            hasMore: offset + donations.length < totalCount,
          },
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch program donations',
        });
      }
    }),

  // Create a new donation
  createDonation: protectedProcedure
    .input(
      z.object({
        programId: z.string(),
        amount: z.number().positive(),
        donorName: z.string(),
        donorEmail: z.string().email(),
        donorPhone: z.string().optional(),
        paymentMethod: z.string(),
        userBankAccountId: z.string().optional(),
        senderBankName: z.string().optional(),
        senderAccountNumber: z.string().optional(),
        senderAccountHolder: z.string().optional(),
        saveBankAccount: z.boolean().optional(),
        transferDate: z.string().optional(),
        donationProofImage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify program exists and is active
        const program = await prisma.program.findFirst({
          where: {
            id: input.programId,
            status: 'active',
          },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found or not active',
          });
        }

        let bankAccountId = input.userBankAccountId;

        // If no bank account ID provided but we have bank details, create/find the account
        if (
          !bankAccountId &&
          input.paymentMethod === 'bank_transfer' &&
          input.senderBankName &&
          input.senderAccountNumber &&
          input.senderAccountHolder
        ) {
          // Check if account already exists (including soft-deleted ones)
          const existingAccount = await prisma.userBankAccount.findFirst({
            where: {
              userId: ctx.session.user.id,
              accountNumber: input.senderAccountNumber,
            },
          });

          if (existingAccount) {
            // If it's soft-deleted, restore it
            if (existingAccount.deletedAt) {
              await prisma.userBankAccount.update({
                where: { id: existingAccount.id },
                data: {
                  bankName: input.senderBankName,
                  accountHolder: input.senderAccountHolder,
                  deletedAt: null, // Restore by removing deletedAt
                  updatedAt: new Date(),
                },
              });
            }
            bankAccountId = existingAccount.id;
          } else if (input.saveBankAccount) {
            // Create new bank account record only if user wants to save it
            const newAccount = await prisma.userBankAccount.create({
              data: {
                userId: ctx.session.user.id,
                bankName: input.senderBankName,
                accountNumber: input.senderAccountNumber,
                accountHolder: input.senderAccountHolder,
                isDefault: false,
              },
            });
            bankAccountId = newAccount.id;
          }
        }

        // Generate unique donation reference number
        const donationReferenceNumber = generateDonationReferenceNumber();

        // Create donation
        const donation = await prisma.donation.create({
          data: {
            userId: ctx.session.user.id,
            programId: input.programId,
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            userBankAccountId: bankAccountId,
            donationReferenceNumber,
            status: 'pending',
            donationProofImage: input.donationProofImage,
            donorName: input.donorName,
            donorEmail: input.donorEmail,
            donorPhone: input.donorPhone,
            ...(input.transferDate && { verifiedAt: input.transferDate }),
          },
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                bannerImage: true,
                targetAmount: true,
              },
            },
            verifiedByAdmin: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            userBankAccount: {
              select: {
                id: true,
                bankName: true,
                accountNumber: true,
                accountHolder: true,
              },
            },
          },
        });

        return {
          success: true,
          donation,
          message: 'Donation created successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create donation',
        });
      }
    }),

  // Get pending donations for admin verification
  getPendingDonations: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().optional().default(10),
        offset: z.number().int().min(0).optional().default(0),
        search: z.string().optional(),
        status: z.enum(['pending', 'verified', 'rejected']).optional(),
        programId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized access',
        });
      }

      try {
        const { limit, offset, search, status, programId } = input;

        // Build where clause
        const where: {
          status?: 'pending' | 'verified' | 'rejected';
          programId?: string;
          OR?: Array<{
            donorName?: { contains: string; mode: 'insensitive' };
            donorEmail?: { contains: string; mode: 'insensitive' };
            donationReferenceNumber?: { contains: string; mode: 'insensitive' };
            program?: { title: { contains: string; mode: 'insensitive' } };
            userBankAccount?: {
              accountHolder: { contains: string; mode: 'insensitive' };
            };
          }>;
        } = {};

        if (status) {
          where.status = status;
        }
        // If no status specified, don't filter by status (show all)

        if (programId && programId !== 'all') {
          where.programId = programId;
        }

        if (search) {
          where.OR = [
            { donorName: { contains: search, mode: 'insensitive' } },
            { donorEmail: { contains: search, mode: 'insensitive' } },
            {
              donationReferenceNumber: {
                contains: search,
                mode: 'insensitive',
              },
            },
            { program: { title: { contains: search, mode: 'insensitive' } } },
            {
              userBankAccount: {
                accountHolder: { contains: search, mode: 'insensitive' },
              },
            },
          ];
        }

        const donations = await prisma.donation.findMany({
          where,
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                bannerImage: true,
              },
            },
            verifiedByAdmin: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            userBankAccount: {
              select: {
                id: true,
                bankName: true,
                accountNumber: true,
                accountHolder: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        });

        const totalCount = await prisma.donation.count({ where });

        return {
          donations,
          pagination: {
            totalCount,
            hasMore: offset + donations.length < totalCount,
          },
        };
      } catch (error) {
        console.error('Error in getPendingDonations:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pending donations',
        });
      }
    }),

  // Verify donation (admin only)
  verifyDonation: protectedProcedure
    .input(
      z.object({
        donationId: z.string(),
        action: z.enum(['verify', 'reject']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized access',
        });
      }

      try {
        const { donationId, action, notes } = input;

        // Find the donation
        const donation = await prisma.donation.findUnique({
          where: { id: donationId },
          include: {
            program: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });

        if (!donation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Donation not found',
          });
        }

        if (donation.status !== 'pending') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Donation is not in pending status',
          });
        }

        // Update donation status
        const newStatus = action === 'verify' ? 'verified' : 'rejected';
        const updateData = {
          status: newStatus as 'pending' | 'verified' | 'rejected',
          verifiedByAdminId: ctx.session.user.id,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        };

        if (notes) {
          // Add notes to the donation record (you might want to create a separate notes field)
          // For now, we'll use a generic approach
        }

        const updatedDonation = await prisma.donation.update({
          where: { id: donationId },
          data: updateData,
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                bannerImage: true,
              },
            },
            verifiedByAdmin: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            userBankAccount: {
              select: {
                id: true,
                bankName: true,
                accountNumber: true,
                accountHolder: true,
              },
            },
          },
        });

        return {
          success: true,
          donation: updatedDonation,
          message: `Donation ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update donation status',
        });
      }
    }),
});
