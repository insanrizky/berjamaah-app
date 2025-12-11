import { TRPCError } from '@trpc/server';
import z from 'zod';
import prisma from '../../prisma/index';
import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import type { Prisma } from '@prisma/client';

// Validation schemas
const createReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  fileUrl: z.string().min(1, 'File URL is required'),
});

const updateReportSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fileUrl: z.string().min(1).optional(),
});

export const reportRouter = router({
  // Get all reports with pagination and filters
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        });
      }

      const { page, limit, search, tags } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.ReportWhereInput = {
        deletedAt: null, // Only get non-deleted reports
      };

      // Search filter
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Tags filter - reports must have ALL selected tags
      if (tags && tags.length > 0) {
        where.AND = tags.map(tag => ({
          tags: { has: tag },
        }));
      }

      // Get reports with pagination
      const [reports, totalCount] = await Promise.all([
        prisma.report.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.report.count({ where }),
      ]);

      // Check if there are more reports
      const hasMore = skip + limit < totalCount;

      return {
        reports,
        total: totalCount,
        hasMore,
      };
    }),

  // Get report by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        });
      }

      const report = await prisma.report.findFirst({
        where: {
          id: input.id,
          deletedAt: null, // Only get non-deleted reports
        },
      });

      if (!report) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Report not found',
        });
      }

      return report;
    }),

  // Create report
  create: protectedProcedure
    .input(createReportSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        });
      }

      try {
        const report = await prisma.report.create({
          data: {
            title: input.title,
            description: input.description || null,
            tags: input.tags || [],
            fileUrl: input.fileUrl,
          },
        });

        return report;
      } catch (error) {
        console.error('Error creating report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create report',
        });
      }
    }),

  // Update report
  update: protectedProcedure
    .input(updateReportSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        });
      }

      try {
        // Check if report exists and is not deleted
        const existingReport = await prisma.report.findFirst({
          where: {
            id: input.id,
            deletedAt: null,
          },
        });

        if (!existingReport) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Report not found',
          });
        }

        const { id, ...updateData } = input;
        const report = await prisma.report.update({
          where: { id },
          data: updateData,
        });

        return report;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update report',
        });
      }
    }),

  // Delete report (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        });
      }

      try {
        // Check if report exists and is not already deleted
        const existingReport = await prisma.report.findFirst({
          where: {
            id: input.id,
            deletedAt: null,
          },
        });

        if (!existingReport) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Report not found',
          });
        }

        // Soft delete by setting deletedAt timestamp
        await prisma.report.update({
          where: { id: input.id },
          data: {
            deletedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return { success: true, message: 'Report deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete report',
        });
      }
    }),

  // Get latest reports (public)
  getLatest: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ input }) => {
      const { limit } = input;

      const reports = await prisma.report.findMany({
        where: {
          deletedAt: null, // Only get non-deleted reports
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          tags: true,
          fileUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return reports;
    }),

  // Get all reports (public) - for public reports page
  getAllPublic: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.ReportWhereInput = {
        deletedAt: null, // Only get non-deleted reports
      };

      // Get reports with pagination
      const [reports, totalCount] = await Promise.all([
        prisma.report.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            fileUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.report.count({ where }),
      ]);

      // Check if there are more reports
      const hasMore = skip + limit < totalCount;

      return {
        reports,
        total: totalCount,
        hasMore,
      };
    }),

  // Get all unique tags
  getTags: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.session.user.role !== 'admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    try {
      const reports = await prisma.report.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          tags: true,
        },
      });

      // Extract all unique tags
      const allTags = reports.flatMap(report => report.tags);
      const uniqueTags = Array.from(new Set(allTags)).sort();

      return uniqueTags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tags',
      });
    }
  }),
});
