import { TRPCError } from '@trpc/server';
import z from 'zod';
import prisma from '../../prisma/index';
import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import { cache, cacheKeys, cacheTTL } from '../lib/cache';

// Validation schemas
const createProgramSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  bannerImage: z.string().min(1).optional().or(z.literal('')),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive']).default('draft'),
  contact: z.string().optional(),
  details: z.string().optional(),
});

const updateProgramSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  bannerImage: z.string().min(1).optional().or(z.literal('')),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional(),
  contact: z.string().optional(),
  details: z.string().optional(),
});

export const programRouter = router({
  // Program CRUD operations
  getAll: publicProcedure
    .input(
      z.object({
        status: z.enum(['draft', 'active', 'inactive']).optional(),
        category: z.string().optional(),
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().min(0).default(0),
        adminView: z.boolean().optional().default(false), // For admin to see all programs
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Use cache for program list (short TTL due to frequent updates)
        return await cache.getOrSet(
          cacheKeys.programList(
            input.status,
            input.category,
            input.offset,
            input.limit
          ),
          async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where: Record<string, any> = {
              deletedAt: null, // Only get non-deleted programs
            };

            // Non-admin users can only see active programs
            if (!input.adminView && ctx?.session?.user?.role !== 'admin') {
              where.status = 'active';
            } else if (input.status) {
              where.status = input.status;
            }

            if (input.category) {
              where.category = input.category;
            }

            // Optimized: Single query with aggregation instead of N+1 queries
            const [programs, total] = await Promise.all([
              prisma.program.findMany({
                where,
                select: {
                  id: true,
                  title: true,
                  description: true,
                  targetAmount: true,
                  bannerImage: true,
                  category: true,
                  status: true,
                  contact: true,
                  details: true,
                  createdAt: true,
                  updatedAt: true,
                  // Get verified donations with aggregation in single query
                  donations: {
                    where: {
                      status: 'verified',
                    },
                    select: {
                      amount: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: input.limit,
                skip: input.offset,
              }),
              prisma.program.count({ where }),
            ]);

            // Calculate progress percentage efficiently (no additional queries)
            const programsWithProgress = programs.map(program => {
              const totalRaisedAmount = program.donations.reduce(
                (sum, donation) => sum + Number(donation.amount),
                0
              );
              const totalDonationCount = program.donations.length;
              const progressPercentage =
                Number(program.targetAmount) > 0
                  ? (totalRaisedAmount / Number(program.targetAmount)) * 100
                  : 0;

              return {
                ...program,
                totalRaisedAmount,
                totalDonationCount,
                progressPercentage,
                // Remove donations array from response to reduce payload
                donations: undefined,
              };
            });

            return {
              programs: programsWithProgress,
              total,
              hasMore: input.offset + input.limit < total,
            };
          },
          cacheTTL.SHORT // Cache for 1 minute due to frequent updates
        );
      } catch (error) {
        console.error('Error in getAll programs:', error);

        // Check if it's a database connection error
        if (
          error instanceof Error &&
          error.message.includes("Can't reach database server")
        ) {
          // Return empty results when database is not available
          return {
            programs: [],
            total: 0,
            hasMore: false,
          };
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch programs',
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const [program, donationTotals] = await Promise.all([
          prisma.program.findFirst({
            where: { 
              id: input.id,
              deletedAt: null, // Only get non-deleted programs
            },
            include: {
              createdByUser: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
              _count: {
                select: {
                  donations: true,
                },
              },
            },
          }),
          prisma.donation.aggregate({
            where: {
              programId: input.id,
              status: 'verified',
            },
            _sum: { amount: true },
            _count: true,
          }),
        ]);

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        const totalRaisedAmount = Number(donationTotals._sum.amount || 0);
        const totalDonationCount = donationTotals._count;
        const progressPercentage =
          program && Number(program.targetAmount) > 0
            ? (totalRaisedAmount / Number(program.targetAmount)) * 100
            : 0;

        return {
          ...program,
          totalRaisedAmount,
          totalDonationCount,
          progressPercentage,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch program details',
        });
      }
    }),

  create: protectedProcedure
    .input(createProgramSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const program = await prisma.program.create({
          data: {
            ...input,
            targetAmount: input.targetAmount,
            createdBy: ctx.session.user.id,
          },
          include: {
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return program;
      } catch (error) {
        console.log('error adsf', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create program',
        });
      }
    }),

  update: protectedProcedure
    .input(updateProgramSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the creator of the program and it's not deleted
        const existingProgram = await prisma.program.findFirst({
          where: { 
            id: input.id,
            deletedAt: null, // Only allow updates to non-deleted programs
          },
          select: { createdBy: true },
        });

        if (!existingProgram) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        if (existingProgram.createdBy !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update programs you created',
          });
        }

        const { id, ...updateData } = input;
        const program = await prisma.program.update({
          where: { id },
          data: updateData,
          include: {
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return program;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update program',
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the creator of the program and it's not already deleted
        const existingProgram = await prisma.program.findFirst({
          where: { 
            id: input.id,
            deletedAt: null, // Only allow deletion of non-deleted programs
          },
          select: { createdBy: true },
        });

        if (!existingProgram) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        if (existingProgram.createdBy !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete programs you created',
          });
        }

        // Soft delete by setting deletedAt timestamp
        await prisma.program.update({
          where: { id: input.id },
          data: {
            deletedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return { success: true, message: 'Program deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete program',
        });
      }
    }),

  // Update program status
  updateProgramStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['draft', 'active', 'inactive']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the creator of the program and it's not deleted
        const existingProgram = await prisma.program.findFirst({
          where: { 
            id: input.id,
            deletedAt: null, // Only allow status updates to non-deleted programs
          },
          select: { createdBy: true, status: true },
        });

        if (!existingProgram) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        if (existingProgram.createdBy !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update programs you created',
          });
        }

        // Validate status transitions
        const currentStatus = existingProgram.status;
        const newStatus = input.status;

        // Define valid status transitions
        const validTransitions: Record<string, string[]> = {
          draft: ['active', 'inactive'],
          active: ['inactive'],
          inactive: ['active'],
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot change status from ${currentStatus} to ${newStatus}`,
          });
        }

        const updatedProgram = await prisma.program.update({
          where: { id: input.id },
          data: { status: newStatus },
          include: {
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return updatedProgram;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update program status',
        });
      }
    }),

  // Additional utility queries
  getProgramStats: publicProcedure.query(async () => {
    try {
      // Use cache for expensive stats calculation
      return await cache.getOrSet(
        cacheKeys.programStats(),
        async () => {
          // Execute all queries in parallel for better performance
          const [
            totalActivePrograms,
            totalInactivePrograms,
            totalDonators,
            totalDonationAmount,
          ] = await Promise.all([
            // Total active programs
            prisma.program.count({
              where: {
                status: 'active',
              },
            }),
            // Total inactive programs
            prisma.program.count({
              where: {
                status: 'inactive',
              },
            }),
            // Total unique donators (more efficient with groupBy)
            prisma.donation
              .groupBy({
                by: ['donorEmail'],
                where: {
                  status: 'verified',
                },
              })
              .then(result => result.length),
            // Total amount of verified donations
            prisma.donation.aggregate({
              where: {
                status: 'verified',
              },
              _sum: {
                amount: true,
              },
            }),
          ]);

          return {
            totalActivePrograms,
            totalInactivePrograms,
            totalDonators,
            totalDonationAmount: Number(totalDonationAmount._sum.amount || 0),
          };
        },
        cacheTTL.MEDIUM // Cache for 5 minutes
      );
    } catch (error) {
      console.error('Error in getProgramStats:', error);

      // Check if it's a database connection error
      if (
        error instanceof Error &&
        error.message.includes("Can't reach database server")
      ) {
        // Return default values when database is not available
        return {
          totalActivePrograms: 0,
          totalInactivePrograms: 0,
          totalDonators: 0,
          totalDonationAmount: 0,
        };
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch program statistics',
      });
    }
  }),
});
