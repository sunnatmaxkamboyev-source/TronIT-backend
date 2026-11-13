import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "MongoDB ID noto'g'ri");

const booleanSchema = z.preprocess(
  (value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  },
  z.boolean().optional()
);

export const createLessonSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(150),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    course: objectIdSchema,

    duration: z.coerce
      .number()
      .int()
      .min(0)
      .max(86400),

    order: z.coerce
      .number()
      .int()
      .min(1),

    isFree: booleanSchema,
  }).strict(),

  params: z.object({}),
  query: z.object({}),
});

export const updateLessonSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(150).optional(),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    course: objectIdSchema.optional(),

    duration: z.coerce
      .number()
      .int()
      .min(0)
      .max(86400)
      .optional(),

    order: z.coerce
      .number()
      .int()
      .min(1)
      .optional(),

    isFree: booleanSchema,
    isPublished: booleanSchema,
  })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "Kamida bitta maydon yuborilishi kerak"
    ),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export const lessonIdSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export const getLessonsSchema = z.object({
  body: z.object({}),
  params: z.object({}),

  query: z.object({
    course: objectIdSchema.optional(),

    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),
  }),
});
