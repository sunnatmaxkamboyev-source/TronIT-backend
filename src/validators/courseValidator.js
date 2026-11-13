import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "MongoDB ID noto'g'ri");

const courseFields = {
  title: z.string().trim().min(3).max(150),
  shortDescription: z.string().trim().min(3).max(300),
  description: z.string().trim().min(10).max(10000),
  thumbnail: z.string().url().optional().or(z.literal("")),
  previewVideo: z.string().url().optional().or(z.literal("")),
  instructorName: z.string().trim().min(2).max(100),
  instructorAvatar: z.string().url().optional().or(z.literal("")),
  category: objectIdSchema,
  level: z.enum(["beginner", "intermediate", "advanced"]),
  language: z.enum(["uz", "ru", "en"]).default("uz"),
  price: z.coerce.number().min(0).max(100000000),
  discountPrice: z.coerce.number().min(0).optional(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  requirements: z.array(z.string().trim().max(300)).max(30).optional(),
  learningOutcomes: z.array(z.string().trim().max(300)).max(30).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
};

const emptyObject = z.object({});

export const createCourseSchema = z.object({
  body: z.object(courseFields).strict().refine(
    (data) =>
      data.discountPrice === undefined ||
      data.discountPrice <= data.price,
    {
      message: "Chegirma narxi oddiy narxdan yuqori bo'lishi mumkin emas",
      path: ["discountPrice"],
    }
  ),
  params: emptyObject,
  query: emptyObject,
});

export const updateCourseSchema = z.object({
  body: z.object({
    title: courseFields.title.optional(),
    shortDescription: courseFields.shortDescription.optional(),
    description: courseFields.description.optional(),
    thumbnail: courseFields.thumbnail,
    previewVideo: courseFields.previewVideo,
    instructorName: courseFields.instructorName.optional(),
    instructorAvatar: courseFields.instructorAvatar,
    category: objectIdSchema.optional(),
    level: courseFields.level.optional(),
    language: z.enum(["uz", "ru", "en"]).optional(),
    price: courseFields.price.optional(),
    discountPrice: courseFields.discountPrice,
    tags: courseFields.tags,
    requirements: courseFields.requirements,
    learningOutcomes: courseFields.learningOutcomes,
    status: courseFields.status,
    isFeatured: courseFields.isFeatured,
  }).strict().refine(
    (data) => Object.keys(data).length > 0,
    "Kamida bitta maydon yuborilishi kerak"
  ),
  params: z.object({ id: objectIdSchema }),
  query: emptyObject,
});

export const deleteCourseSchema = z.object({
  body: emptyObject,
  params: z.object({ id: objectIdSchema }),
  query: emptyObject,
});
