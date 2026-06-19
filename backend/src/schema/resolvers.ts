import { PrismaClient, Status, JobType } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { CreateApplicationSchema, UpdateApplicationSchema } from './validation.js';

const prisma = new PrismaClient();

interface ApplicationsArgs {
  status?: Status;
  search?: string;
  limit?: number;
  offset?: number;
}

interface ApplicationStatsArgs {
  search?: string;
}

function buildSearchWhere(search?: string) {
  return search
    ? {
        OR: [
          { company_name: { contains: search, mode: 'insensitive' as const } },
          { job_title: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};
}

function clampPagination(limit?: number, offset?: number) {
  const take = Math.min(Math.max(limit ?? 10, 1), 100);
  const skip = Math.max(offset ?? 0, 0);
  return { take, skip };
}

interface ApplicationArgs {
  id: string;
}

interface CreateApplicationArgs {
  input: {
    company_name: string;
    job_title: string;
    job_type: JobType;
    status?: Status;
    applied_date: string;
    notes?: string;
  };
}

interface UpdateApplicationArgs {
  id: string;
  input: {
    company_name?: string;
    job_title?: string;
    job_type?: JobType;
    status?: Status;
    applied_date?: string;
    notes?: string;
  };
}

interface DeleteApplicationArgs {
  id: string;
}

export const resolvers = {
  Query: {
    applications: async (_: unknown, args: ApplicationsArgs) => {
      const { status, search, limit, offset } = args;
      const { take, skip } = clampPagination(limit, offset);

      const where = {
        ...(status ? { status } : {}),
        ...buildSearchWhere(search),
      };

      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          where,
          orderBy: { created_at: 'desc' },
          take,
          skip,
        }),
        prisma.application.count({ where }),
      ]);

      return {
        items: applications.map((app) => ({
          ...app,
          applied_date: app.applied_date.toISOString(),
          created_at: app.created_at.toISOString(),
          updated_at: app.updated_at.toISOString(),
        })),
        total,
      };
    },

    applicationStats: async (_: unknown, args: ApplicationStatsArgs) => {
      const where = buildSearchWhere(args.search);

      const [total, applied, interviewing, offer, rejected] = await Promise.all([
        prisma.application.count({ where }),
        prisma.application.count({ where: { ...where, status: 'Applied' } }),
        prisma.application.count({ where: { ...where, status: 'Interviewing' } }),
        prisma.application.count({ where: { ...where, status: 'Offer' } }),
        prisma.application.count({ where: { ...where, status: 'Rejected' } }),
      ]);

      return { total, applied, interviewing, offer, rejected };
    },

    application: async (_: unknown, args: ApplicationArgs) => {
      const app = await prisma.application.findUnique({
        where: { id: args.id },
      });

      if (!app) {
        throw new GraphQLError('Application not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return {
        ...app,
        applied_date: app.applied_date.toISOString(),
        created_at: app.created_at.toISOString(),
        updated_at: app.updated_at.toISOString(),
      };
    },
  },

  Mutation: {
    createApplication: async (_: unknown, args: CreateApplicationArgs) => {
      const parsed = CreateApplicationSchema.safeParse(args.input);

      if (!parsed.success) {
        throw new GraphQLError(parsed.error.errors[0].message, {
          extensions: { code: 'BAD_USER_INPUT', details: parsed.error.errors },
        });
      }

      const { applied_date, ...rest } = parsed.data;

      const app = await prisma.application.create({
        data: {
          ...rest,
          applied_date: new Date(applied_date),
        },
      });

      return {
        ...app,
        applied_date: app.applied_date.toISOString(),
        created_at: app.created_at.toISOString(),
        updated_at: app.updated_at.toISOString(),
      };
    },

    updateApplication: async (_: unknown, args: UpdateApplicationArgs) => {
      const parsed = UpdateApplicationSchema.safeParse(args.input);

      if (!parsed.success) {
        throw new GraphQLError(parsed.error.errors[0].message, {
          extensions: { code: 'BAD_USER_INPUT', details: parsed.error.errors },
        });
      }

      const existing = await prisma.application.findUnique({
        where: { id: args.id },
      });

      if (!existing) {
        throw new GraphQLError('Application not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const { applied_date, ...rest } = parsed.data;

      const app = await prisma.application.update({
        where: { id: args.id },
        data: {
          ...rest,
          ...(applied_date ? { applied_date: new Date(applied_date) } : {}),
        },
      });

      return {
        ...app,
        applied_date: app.applied_date.toISOString(),
        created_at: app.created_at.toISOString(),
        updated_at: app.updated_at.toISOString(),
      };
    },

    deleteApplication: async (_: unknown, args: DeleteApplicationArgs) => {
      const existing = await prisma.application.findUnique({
        where: { id: args.id },
      });

      if (!existing) {
        throw new GraphQLError('Application not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await prisma.application.delete({ where: { id: args.id } });
      return true;
    },
  },
};
