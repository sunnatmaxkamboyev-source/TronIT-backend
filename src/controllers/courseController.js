import mongoose from "mongoose";

import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";



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

    if (!title || !shortDescription || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, shortDescription va description kiritilishi shart",
      });
    }

    if (category && !mongoose.isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Category ID noto'g'ri",
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
      price: Number(price) || 0,
      discountPrice:
        discountPrice !== undefined && discountPrice !== ""
          ? Number(discountPrice)
          : undefined,
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
    next(error);
  }
};



export const getCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      language,
      search,
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(
      50,
      Math.max(1, Number(limit) || 10)
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

    if (level) filter.level = level;
    if (language) filter.language = language;

    if (search) {
      filter.$text = { $search: search };
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("category", "name slug icon")
        .populate("createdBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),

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



export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Course ID noto'g'ri",
      });
    }

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

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.category && !mongoose.isValidObjectId(updates.category)) {
      return res.status(400).json({
        success: false,
        message: "Category ID noto'g'ri",
      });
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);

      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).json({
          success: false,
          message: "Kurs narxi noto'g'ri",
        });
      }
    }

    if (updates.discountPrice !== undefined) {
      updates.discountPrice = Number(updates.discountPrice);

      if (
        !Number.isFinite(updates.discountPrice) ||
        updates.discountPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Chegirma narxi noto'g'ri",
        });
      }
    }

    const course = await Course.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kurs muvaffaqiyatli yangilandi",
      course,
    });
  } catch (error) {
    next(error);
  }
};



export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Course ID noto'g'ri",
      });
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { status: "archived" },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kurs arxivlandi",
    });
  } catch (error) {
    next(error);
  }
};
