
import { z } from "zod";


export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
      .max(50, "Ism juda uzun"),

    lastName: z
      .string()
      .trim()
      .min(2, "Familiya kamida 2 ta belgidan iborat bo'lishi kerak")
      .max(50, "Familiya juda uzun"),

    email: z
      .string()
      .trim()
      .email("Email formati noto'g'ri")
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
      .max(128, "Parol juda uzun"),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Login validation
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Email formati noto'g'ri")
      .toLowerCase(),

    password: z
      .string()
      .min(1, "Parol kiritilishi shart")
      .max(128, "Parol juda uzun"),
  }),
  params: z.object({}),
  query: z.object({}),
});
