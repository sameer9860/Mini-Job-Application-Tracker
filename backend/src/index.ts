import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ApolloServer } from '@apollo/server';
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from '@as-integrations/fastify';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './schema/resolvers.js';
import { CreateApplicationSchema, UpdateApplicationSchema } from './schema/validation.js';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

await app.register(cors, {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
});

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [fastifyApolloDrainPlugin(app)],
  introspection: true,
});

await apollo.start();

// GraphQL Endpoint
app.route({
  url: '/graphql',
  method: ['GET', 'POST', 'OPTIONS'],
  handler: fastifyApolloHandler(apollo),
});

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// REST API Endpoints
// 1. GET /applications - list applications with status, search, and pagination
app.get('/applications', async (request, reply) => {
  const { status, search, limit, offset } = request.query as {
    status?: string;
    search?: string;
    limit?: string;
    offset?: string;
  };
  try {
    const take = Math.min(Math.max(parseInt(limit ?? '10', 10) || 10, 1), 100);
    const skip = Math.max(parseInt(offset ?? '0', 10) || 0, 0);

    const where = {
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { company_name: { contains: search, mode: 'insensitive' as const } },
              { job_title: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take,
        skip,
      }),
      prisma.application.count({ where }),
    ]);

    return { items, total };
  } catch (err: any) {
    app.log.error(err);
    return reply.status(500).send({ error: 'Internal Server Error', message: err.message });
  }
});

// 2. GET /applications/:id - get a single application
app.get('/applications/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const application = await prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      return reply.status(404).send({ error: 'Not Found', message: 'Application not found' });
    }
    return application;
  } catch (err: any) {
    app.log.error(err);
    return reply.status(500).send({ error: 'Internal Server Error', message: err.message });
  }
});

// 3. POST /applications - create a new application
app.post('/applications', async (request, reply) => {
  const parsed = CreateApplicationSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: parsed.error.errors[0].message,
      details: parsed.error.errors,
    });
  }

  try {
    const { applied_date, ...rest } = parsed.data;
    const application = await prisma.application.create({
      data: {
        ...rest,
        applied_date: new Date(applied_date),
      },
    });
    return reply.status(201).send(application);
  } catch (err: any) {
    app.log.error(err);
    return reply.status(500).send({ error: 'Internal Server Error', message: err.message });
  }
});

// 4. PATCH /applications/:id - update an application partially
app.patch('/applications/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const parsed = UpdateApplicationSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: parsed.error.errors[0].message,
      details: parsed.error.errors,
    });
  }

  try {
    const existing = await prisma.application.findUnique({
      where: { id },
    });
    if (!existing) {
      return reply.status(404).send({ error: 'Not Found', message: 'Application not found' });
    }

    const { applied_date, ...rest } = parsed.data;
    const application = await prisma.application.update({
      where: { id },
      data: {
        ...rest,
        ...(applied_date ? { applied_date: new Date(applied_date) } : {}),
      },
    });
    return application;
  } catch (err: any) {
    app.log.error(err);
    return reply.status(500).send({ error: 'Internal Server Error', message: err.message });
  }
});

// 5. DELETE /applications/:id - delete an application
app.delete('/applications/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const existing = await prisma.application.findUnique({
      where: { id },
    });
    if (!existing) {
      return reply.status(404).send({ error: 'Not Found', message: 'Application not found' });
    }

    await prisma.application.delete({
      where: { id },
    });
    return reply.status(204).send();
  } catch (err: any) {
    app.log.error(err);
    return reply.status(500).send({ error: 'Internal Server Error', message: err.message });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`🚀 GraphQL endpoint at http://localhost:${PORT}/graphql`);
  console.log(`🔍 Apollo Sandbox: https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:${PORT}/graphql`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
