import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { z, ZodError } from 'zod';
import type { StatusCodes } from 'http-status-codes';

export function errorHandler(
  error: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    const err = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return reply.status(400).send({
      status: 'Validation error',
      err,
    });
  }
  return reply.status(500).send(error);
}

export function httpError({
  reply,
  message,
  code,
  cause,
}: {
  reply: FastifyReply;
  message: string;
  code: StatusCodes;
  cause: string;
}) {
  return reply.status(code).send({
    message,
    cause,
  });
}

export const httpErrorSchema = z.object({
  message: z.string(),
  cause: z.string().optional(),
});

export const errorResponse = {
  400: httpErrorSchema,
  401: httpErrorSchema,
  402: httpErrorSchema,
  403: httpErrorSchema,
  404: httpErrorSchema,
  409: httpErrorSchema,
  500: httpErrorSchema,
};
