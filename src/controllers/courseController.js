
import mongoose from "mongoose";

import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Category from "../models/Category.js";

// Ruxsat berilgan maydonlar
const allowedFields = [
  "title",
  "shortDescription",
  "description",
  "thumbnail",
  "previewVideo",
  "instructorName",
  "instructorAvatar",
  "category",
  "level",
  "language",
  "price",
  "discountPrice",
  "tags",
  "requirements",
  "learningOutcomes",
  "isFeatured",
  "status",
];

// MongoDB duplicate key xatosini aniqlash
const isDuplicateError = (error) => error.code === 11000;

// ==================================
// 1. KURS YARATISH
// ==================================

export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      shortDescription,
      description,
      thumbnail,
      previewVideo,
      instructorName,
      instructorAvatar,
      category,
      level,
      language,
      price,
      discountPrice,
      tags,
      requirements,
      learningOutcomes,
      isFeatured,
    } = req.body;

    if (!title || !shortDescription || !description || !category || !instructorName) {
      return res.status(400).json({
        success: false,
        message: "Title, tavsif, kategoriya va o'qituvchi ma'lumotlari kiritilishi shart",
      });
    }

    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Category ID noto'g'ri",
      });
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Kategoriya topilmadi",
      });
    }

    const coursePrice = price === undefined || price === ""
      ? 0
      : Number(price);

    const courseDiscount =
      discountPrice === undefined || discountPrice === ""
        ? null
        : Number(discountPrice);

    if (!Number.isFinite(coursePrice) || coursePrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Kurs narxi noto'g'ri",
      });
    }

    if (
      courseDiscount !== null &&
      (!Number.isFinite(courseDiscount) ||
        courseDiscount < 0 ||
        courseDiscount > coursePrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Chegirma narxi noto'g'ri",
      });
    }

    const course = await Course.create({
      title,
      shortDescription,
      description,
      thumbnail,
      previewVideo,
      instructorName,
      instructorAvatar,
      category,
      level,
      language,
      price: coursePrice,
      discountPrice: courseDiscount,
      tags,
      requirements,
      learningOutcomes,
      isFeatured: isFeatured === true || isFeatured === "true",
      createdBy: req.user._id,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Kurs muvaffaqiyatli yaratildi",
      course,
    });
  } catch (error) {
    if (isDuplicateError(error)) {
      return res.status(409).json({
        success: false,
        message: "Bunday slug bilan kurs mavjud",
      });
    }

    next(error);
  }
};

// ==================================
// 2. BARCHA OCHIQ KURSLARNI OLISH
// ==================================

export const getCourses = async (req, res, next) => {
  try {
    const {
      category,
      level,
      language,
      search,
    } = req.query;

    const pageNumber = Math.min(
      100000,
      Math.max(1, Number(req.query.page) || 1)
    );

    const limitNumber = Math.min(
      50,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const filter = {
      status: "published",
    };

    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Category ID noto'g'ri",
        });
      }

      filter.category = category;
    }

    if (level) {
      if (!["beginner", "intermediate", "advanced"].includes(level)) {
        return res.status(400).json({
          success: false,
          message: "Kurs darajasi noto'g'ri",
        });
      }

      filter.level = level;
    }

    if (language) {
      if (!["uz", "ru", "en"].includes(language)) {
        return res.status(400).json({
          success: false,
          message: "Kurs tili noto'g'ri",
        });
      }

      filter.language = language;
    }

    if (search) {
      if (typeof search !== "string" || search.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Qidiruv so'rovi noto'g'ri",
        });
      }

      filter.$text = {
        $search: search.trim(),
      };
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("category", "name slug icon")
        .populate("createdBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),

      Course.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      courses,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================
// 3. BITTA KURSNI OLISH
// ==================================

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Course ID noto'g'ri",
      });
    }

    const course = await Course.findOne({
      _id: id,
      status: "published",
    })
      .populate("category", "name slug icon")
      .populate("createdBy", "firstName lastName");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================
// 4. KURSNI YANGILASH
// ==================================

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Course ID noto'g'ri",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Yangilash uchun ma'lumot yuborilmadi",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi",
      });
    }

    // Kategoriya mavjudligini tekshirish
    if (updates.category !== undefined) {
      if (!mongoose.isValidObjectId(updates.category)) {
        return res.status(400).json({
          success: false,
          message: "Category ID noto'g'ri",
        });
      }

      const categoryExists = await Category.exists({
        _id: updates.category,
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Kategoriya topilmadi",
        });
      }
    }

    // Narxlarni tekshirish
    const finalPrice = updates.price !== undefined
      ? Number(updates.price)
      : course.price;

    let finalDiscount = course.discountPrice;

    if (updates.price !== undefined) {
      if (!Number.isFinite(finalPrice) || finalPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Kurs narxi noto'g'ri",
        });
      }

      updates.price = finalPrice;
    }

    if (updates.discountPrice !== undefined) {
      finalDiscount =
        updates.discountPrice === null || updates.discountPrice === ""
          ? null
          : Number(updates.discountPrice);

      if (
        finalDiscount !== null &&
        (!Number.isFinite(finalDiscount) ||
          finalDiscount < 0 ||
          finalDiscount > finalPrice)
      ) {
        return res.status(400).json({
          success: false,
          message: "Chegirma narxi noto'g'ri",
        });
      }

      updates.discountPrice = finalDiscount;
    } else if (
      finalDiscount !== null &&
      finalDiscount > finalPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Yangi narx mavjud chegirma narxidan past bo'lishi mumkin emas",
      });
    }

    // Kursni publish qilish shartlari
    if (updates.status === "published") {
      const publishedLessons = await Lesson.countDocuments({
        course: course._id,
        isPublished: true,
      });

      if (publishedLessons === 0) {
        return res.status(400).json({
          success: false,
          message: "Kursni publish qilish uchun kamida bitta e'lon qilingan dars kerak",
        });
      }

      const categoryExists = await Category.exists({
        _id: updates.category || course.category,
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Kurs kategoriyasi mavjud emas",
        });
      }
    }

    // Faqat ruxsat etilgan maydonlarni yangilash
    Object.assign(course, updates);

    // save() slug pre-validate hook'ini ham ishga tushiradi
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Kurs muvaffaqiyatli yangilandi",
      course,
    });
  } catch (error) {
    if (isDuplicateError(error)) {
      return res.status(409).json({
        success: false,
        message: "Bunday slug bilan kurs mavjud",
      });
    }

    next(error);
  }
};

// ==================================
// 5. KURSNI ARXIVLASH
// ==================================

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Course ID noto'g'ri",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi",
      });
    }

    course.status = "archived";
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Kurs arxivlandi",
    });
  } catch (error) {
    next(error);
  }
};
     