import { z } from "zod";


const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Kurs ID noto'g'ri");


export const enrollCourseSchema = z.object({
  body: z.object({
    courseId: objectIdSchema,
  }).strict(),

  params: z.object({}),
  query: z.object({}),
});


export const getEnrollmentByCourseSchema = z.object({
  body: z.object({}),

  params: z.object({
    courseId: objectIdSchema,
  }),

  query: z.object({}),
});


export const cancelEnrollmentSchema = z.object({
  body: z.object({}),

  params: z.object({
    courseId: objectIdSchema,
  }),

  query: z.object({}),
});


export const getMyEnrollmentsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});
