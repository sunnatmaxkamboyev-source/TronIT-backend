
import fs from "fs/promises";
import path from "path";
import { createReadStream } from "fs";
import mongoose from "mongoose";

import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";



export const uploadLesson = async (req, res, next) => {
  try {
    const {
      title,
      description,
      course,
      duration,
      order,
      isFree,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "MP4 video fayl yuklanishi shart",
      });
    }

    if (!title || !course || !order) {
      await fs.unlink(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Title, course va order kiritilishi shart",
      });
    }

    if (!mongoose.isValidObjectId(course)) {
      await fs.unlink(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Course ID formati noto'g'ri",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      await fs.unlink(req.file.path);

      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi",
      });
    }

    const lesson = await Lesson.create({
      title,
      description,
      course,
      video: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: path.relative(process.cwd(), req.file.path)
          .replace(/\\/g, "/"),
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      duration: Number(duration) || 0,
      order: Number(order),
      isFree: isFree === "true",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Dars muvaffaqiyatli yuklandi",
      lesson,
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
};

// ==================================
// 2. BARCHA DARSLARNI OLISH
// ==================================

export const getLessons = async (req, res, next) => {
  try {
    const { course, page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(
      50,
      Math.max(1, Number(limit) || 10)
    );

    const filter = {
      isPublished: true,
    };

    if (course) {
      if (!mongoose.isValidObjectId(course)) {
        return res.status(400).json({
          success: false,
          message: "Course ID formati noto'g'ri",
        });
      }

      filter.course = course;
    }

    const [lessons, total] = await Promise.all([
      Lesson.find(filter)
        .select("-video.path -video.filename -video.originalName")
        .sort({ order: 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),

      Lesson.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      lessons,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================
// 3. BITTA DARSNI OLISH
// ==================================

export const getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Dars ID formati noto'g'ri",
      });
    }

    const lesson = await Lesson.findOne({
      _id: id,
      isPublished: true,
    }).select(
      "-video.path -video.filename -video.originalName"
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Dars topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================
// 4. VIDEO STREAMING
// ==================================

export const streamLessonVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Dars ID formati noto'g'ri",
      });
    }

    const lesson = await Lesson.findById(id);

    if (!lesson || !lesson.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Video topilmadi",
      });
    }

    // Bepul dars bo'lmasa, enrollment tekshiriladi
    if (!lesson.isFree) {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: lesson.course,
        status: "active",
        paymentStatus: { $in: ["free", "paid"] },
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "Bu kurs videosini ko'rish uchun kursga yozilishingiz kerak",
        });
      }
    }

    const videoPath = path.resolve(lesson.video.path);
    const stat = await fs.stat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "private, no-store");

    if (!range) {
      res.status(200);
      res.setHeader("Content-Length", fileSize);

      const stream = createReadStream(videoPath);

      stream.on("error", next);
      return stream.pipe(res);
    }

    const parts = range.replace(/bytes=/, "").split("-");

    const start = Number(parts[0]);
    const end = parts[1]
      ? Number(parts[1])
      : fileSize - 1;

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 0 ||
      end < start ||
      end >= fileSize
    ) {
      return res.status(416).json({
        success: false,
        message: "Video range noto'g'ri",
      });
    }

    const chunkSize = end - start + 1;

    res.status(206);
    res.setHeader(
      "Content-Range",
      `bytes ${start}-${end}/${fileSize}`
    );
    res.setHeader("Content-Length", chunkSize);

    const stream = createReadStream(videoPath, {
      start,
      end,
    });

    stream.on("error", next);
    return stream.pipe(res);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Video fayl serverda topilmadi",
      });
    }

    next(error);
  }
};
