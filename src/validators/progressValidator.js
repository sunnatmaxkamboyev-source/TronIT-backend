import { z } from "zod";

// MongoDB ObjectId
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "MongoDB ID noto'g'ri");

// Darsni tugallash
export const completeLessonSchema = z.object({
  body: z.object({}).strict(),

  params: z.object({
    lessonId: objectIdSchema,
  }),

  query: z.object({}),
});

// Video davomati va oxirgi pozitsiya
export const updateLessonProgressSchema = z.object({
  body: z.object({
    lastPosition: z.coerce
      .number()
      .finite()
      .min(0, "Video pozitsiyasi manfiy bo'lishi mumkin emas")
      .max(86400, "Video pozitsiyasi juda katta"),

    watchTime: z.coerce
      .number()
      .finite()
      .min(0, "Ko'rilgan vaqt manfiy bo'lishi mumkin emas")
      .max(86400, "Ko'rilgan vaqt juda katta"),
  }).strict(),

  params: z.object({
    lessonId: objectIdSchema,
  }),

  query: z.object({}),
});

// Kurs progressini olish
export const getCourseProgressSchema = z.object({
  body: z.object({}),

  params: z.object({
    courseId: objectIdSchema,
  }),

  query: z.object({}),
});


export const getMyProgressSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});
