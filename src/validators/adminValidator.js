import { z } from "zod";


const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "MongoDB ID noto'g'ri");


export const getDashboardStatsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});


export const getAllUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z.string().trim().max(100).optional(),
  }),
});


export const getUserByIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});


export const toggleUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }).strict(),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});
