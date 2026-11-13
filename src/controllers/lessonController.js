
import fs from "fs/promises";
import path from "path";
import { createReadStream } from "fs";
import mongoose from "mongoose";
import { fileTypeFromFile } from "file-type";

import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const VIDEO_DIR = path.resolve(
  process.cwd(),
  "uploads/videos"
);

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const MAX_DURATION = 86400;

// Yuklangan faylni tozalash
const removeUploadedFile = async (file) => {
  if (!file?.path) return;

  await fs.unlink(file.path).catch(() => {});
};

// Xavfsiz video yo'lini olish
const getSafeVideoPath = (filename) => {
  if (
    typeof filename !== "string" ||
    path.basename(filename) !== filename ||
    !/^[a-f0-9-]+\.mp4$/i.test(filename)
  ) {
    throw new Error("Video fayl nomi noto'g'ri");
  }

  return path.join(VIDEO_DIR, filename);
};

// Haqiqiy MP4 formatini tekshirish
const verifyMp4 = async (file) => {
  if (!file || !file.size || file.size <= 0) {
    return false;
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return false;
  }

  const fileType = await fileTypeFromFile(file.path);

  return (
    fileType?.ext === "mp4" &&
    fileType?.mime === "video/mp4"
  );
};

// API javobida ichki fayl yo'llarini yashirish
const safeLesson = (lesson) => {
  const data = lesson.toObject
    ? lesson.toObject()
    : { ...lesson };

  if (data.video) {
    delete data.video.path;
    delete data.video.filename;
    delete data.video.originalName;
  }

  return data;
};

// ==================================
// 1. DARS VA VIDEO YUKLASH
// ==================================

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

    const isValidVideo = await verifyMp4(req.file);

    if (!isValidVideo) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Haqiqiy MP4 video fayl yuklang",
      });
    }

    const orderNumber = Number(order);
    const durationNumber = Number(duration ?? 0);

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof course !== "string" ||
      order === undefined ||
      order === null ||
      order === ""
    ) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Title, course va order kiritilishi shart",
      });
    }

    if (!mongoose.isValidObjectId(course)) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Course ID noto'g'ri",
      });
    }

    if (
      !Number.isInteger(orderNumber) ||
      orderNumber < 1 ||
      !Number.isInteger(durationNumber) ||
      durationNumber < 0 ||
      durationNumber > MAX_DURATION
    ) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Order yoki duration qiymati noto'g'ri",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      await removeUploadedFile(req.file);

      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi",
      });
    }

    if (existingCourse.status === "archived") {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Arxivlangan kursga dars qo'shib bo'lmaydi",
      });
    }

    const lesson = await Lesson.create({
      title: title.trim(),
      description,
      course,

      video: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: path.relative(process.cwd(), req.file.path)
          .replace(/\\/g, "/"),
        size: req.file.size,
        mimetype: "video/mp4",
      },

      duration: durationNumber,
      order: orderNumber,
      isFree: isFree === true,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Dars muvaffaqiyatli yuklandi",
      lesson: safeLesson(lesson),
    });
  } catch (error) {
    await removeUploadedFile(req.file);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bu kursda ushbu tartib raqami band",
      });
    }

    next(error);
  }
};

// ==================================
// 2. BARCHA DARSLARNI OLISH
// ==================================

export const getLessons = async (req, res, next) => {
  try {
    const {
      course,
      page = 1,
      limit = 10,
    } = req.validated?.query ?? req.query;

    const pageNumber = Math.min(100000, Math.max(1, Number(page) || 1));
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

    const filter = {
      isPublished: true,
    };

    if (course) {
      const selectedCourse = await Course.findOne({
        _id: course,
        status: "published",
      }).select("_id");

      if (!selectedCourse) {
        return res.status(404).json({
          success: false,
          message: "Published kurs topilmadi",
        });
      }

      filter.course = course;
    } else {
      const publishedCourseIds = await Course.distinct("_id", {
        status: "published",
      });

      filter.course = {
        $in: publishedCourseIds,
      };
    }

    const [lessons, total] = await Promise.all([
      Lesson.find(filter)
        .select("-video.path -video.filename -video.originalName")
        .sort({ order: 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),

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

    const lesson = await Lesson.findOne({
      _id: id,
      isPublished: true,
    }).select("-video.path -video.filename -video.originalName");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Dars topilmadi",
      });
    }

    const course = await Course.findOne({
      _id: lesson.course,
      status: "published",
    }).select("_id");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi",
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

    const lesson = await Lesson.findById(id);

    if (!lesson || !lesson.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Video topilmadi",
      });
    }

    const course = await Course.findOne({
      _id: lesson.course,
      status: "published",
    }).select("_id");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Kurs mavjud emas yoki nashr qilinmagan",
      });
    }

    if (!lesson.isFree) {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: lesson.course,
        status: "active",
        paymentStatus: {
          $in: ["free", "paid"],
        },
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "Bu videoni ko'rish uchun kursga yozilishingiz kerak",
        });
      }
    }

    const videoPath = getSafeVideoPath(lesson.video?.filename);
    const stat = await fs.stat(videoPath);

    if (!stat.isFile() || stat.size <= 0) {
      return res.status(404).json({
        success: false,
        message: "Video fayl topilmadi",
      });
    }

    const fileSize = stat.size;
    const range = req.headers.range;

    let start = 0;
    let end = fileSize - 1;

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);

      if (!match || (!match[1] && !match[2])) {
        res.setHeader("Content-Range", `bytes */${fileSize}`);
        return res.status(416).end();
      }

      if (!match[1]) {
        const suffixLength = Number(match[2]);

        if (
          !Number.isSafeInteger(suffixLength) ||
          suffixLength <= 0
        ) {
          res.setHeader("Content-Range", `bytes */${fileSize}`);
          return res.status(416).end();
        }

        start = Math.max(0, fileSize - suffixLength);
      } else {
        start = Number(match[1]);
        end = match[2] ? Number(match[2]) : fileSize - 1;
        end = Math.min(end, fileSize - 1);
      }

      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 0 ||
        end < start ||
        start >= fileSize
      ) {
        res.setHeader("Content-Range", `bytes */${fileSize}`);
        return res.status(416).end();
      }
    }

    const chunkSize = end - start + 1;

    if (range) {
      res.status(206);
      res.setHeader(
        "Content-Range",
        `bytes ${start}-${end}/${fileSize}`
      );
    } else {
      res.status(200);
    }

    res.setHeader("Content-Length", chunkSize);

    const stream = createReadStream(videoPath, {
      start,
      end,
    });

    stream.on("error", (error) => {
      if (res.headersSent) {
        res.destroy(error);
      } else {
        next(error);
      }
    });

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

// ==================================
// 5. DARSNI YANGILASH
// ==================================

export const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Dars topilmadi",
      });
    }

    const updates = req.body;

    if (updates.course) {
      const selectedCourse = await Course.findById(updates.course);

      if (!selectedCourse || selectedCourse.status === "archived") {
        return res.status(400).json({
          success: false,
          message: "Tanlangan kurs mavjud emas yoki arxivlangan",
        });
      }
    }

    Object.assign(lesson, updates);

    await lesson.save();

    return res.status(200).json({
      success: true,
      message: "Dars muvaffaqiyatli yangilandi",
      lesson: safeLesson(lesson),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bu kursda ushbu tartib raqami band",
      });
    }

    next(error);
  }
};

// ==================================
// 6. DARSNI O'CHIRISH
// ==================================

export const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Dars topilmadi",
      });
    }

    const videoPath = getSafeVideoPath(lesson.video?.filename);

    await lesson.deleteOne();

    await fs.unlink(videoPath).catch((error) => {
      if (error.code !== "ENOENT") {
        console.error("Video faylni o'chirishda xato:", error);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Dars muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    next(error);
  }
};
