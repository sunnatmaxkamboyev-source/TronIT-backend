
import { z } from "zod";

// Profilni yangilash
export const updateStudentProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
      .max(50, "Ism juda uzun")
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "Familiya kamida 2 ta belgidan iborat bo'lishi kerak")
      .max(50, "Familiya juda uzun")
      .optional(),
  })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "Kamida bitta maydon yuborilishi kerak"
    ),

  params: z.object({}),
  query: z.object({}),
});

// Profilni ko'rish
export const getStudentProfileSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});

// O'quvchining kurslarini olish
export const getStudentCoursesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});

// O'quvchi statistikasini olish
export const getStudentStatsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});

// Hisobni o'chirish
export const deleteStudentAccountSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});
