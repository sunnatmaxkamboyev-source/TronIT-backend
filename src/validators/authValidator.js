
import { z } from "zod";

// REGISTER
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

// LOGIN
export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),

    password: z
      .string()
      .min(1, "Parol kiritilishi shart")
      .max(128, "Parol juda uzun"),
  }),
  params: z.object({}),
  query: z.object({}),
});

// VERIFY EMAIL
export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),

    code: z
      .string()
      .regex(/^\d{6}$/, "Kod 6 ta raqamdan iborat bo'lishi kerak"),
  }),
  params: z.object({}),
  query: z.object({}),
});

// RESEND VERIFICATION
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),
  }),
  params: z.object({}),
  query: z.object({}),
});
