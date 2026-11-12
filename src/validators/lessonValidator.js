
import { z } from "zod";

// MongoDB ObjectId tekshirish
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "MongoDB ID noto'g'ri");

// Form-data boolean qiymatini tekshirish
const booleanSchema = z.preprocess(
  (value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  },
  z.boolean().optional()
);

// Dars yaratish uchun schema
export const createLessonSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, "Dars nomi kamida 3 ta belgidan iborat bo'lishi kerak")
      .max(150, "Dars nomi 150 ta belgidan oshmasligi kerak"),

    description: z
      .string()
      .trim()
      .max(2000, "Tavsif juda uzun")
      .optional(),

    course: objectIdSchema,

    duration: z.coerce
      .number()
      .int("Davomiylik butun son bo'lishi kerak")
      .min(0, "Davomiylik manfiy bo'lishi mumkin emas")
      .max(86400, "Davomiylik 24 soatdan oshmasligi kerak"),

    order: z.coerce
      .number()
      .int("Tartib raqami butun son bo'lishi kerak")
      .min(0, "Tartib raqami manfiy bo'lishi mumkin emas"),

    isFree: booleanSchema,
  }).strict(),

  params: z.object({}),
  query: z.object({}),
});

// Darsni yangilash uchun schema
export const updateLessonSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3)
      .max(150)
      .optional(),

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
      .min(0)
      .optional(),

    isFree: booleanSchema,
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

// Dars ID tekshirish
export const lessonIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

// Darslar ro'yxati uchun query tekshirish
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
