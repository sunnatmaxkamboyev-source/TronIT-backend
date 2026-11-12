import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Kategoriya nomi kamida 2 ta belgidan iborat bo'lishi kerak")
      .max(100, "Kategoriya nomi juda uzun"),

    description: z
      .string()
      .trim()
      .max(500, "Tavsif 500 ta belgidan oshmasligi kerak")
      .optional(),

    icon: z.string().max(100).optional(),

    thumbnail: z.string().url("Thumbnail URL noto'g'ri").optional(),

    order: z.coerce
      .number()
      .int()
      .min(0, "Order manfiy bo'lishi mumkin emas")
      .optional(),
  }).strict(),
  params: z.object({}),
  query: z.object({}),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    icon: z.string().max(100).optional(),
    thumbnail: z.string().url().optional(),
    order: z.coerce.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }).strict().refine(
    (data) => Object.keys(data).length > 0,
    "Kamida bitta maydon yuborilishi kerak"
  ),
  params: z.object({}),
  query: z.object({}),
});
