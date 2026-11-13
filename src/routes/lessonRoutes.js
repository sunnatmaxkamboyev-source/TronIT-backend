
import express from "express";

import {
  uploadLesson,
  getLessons,
  getLessonById,
  streamLessonVideo,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";

import {
  protect,
  adminOnly,
} from "../middlewares/authMiddleware.js";

import upload from "../middlewares/uploadMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  createLessonSchema,
  updateLessonSchema,
  lessonIdSchema,
  getLessonsSchema,
} from "../validators/lessonValidator.js";

const router = express.Router();

// Barcha nashr qilingan darslar
router.get(
  "/",
  validate(getLessonsSchema),
  getLessons
);

// Video streaming
router.get(
  "/:id/video",
  protect,
  validate(lessonIdSchema),
  streamLessonVideo
);

// Bitta nashr qilingan dars
router.get(
  "/:id",
  validate(lessonIdSchema),
  getLessonById
);

// Dars va video yuklash
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("video"),
  validate(createLessonSchema),
  uploadLesson
);

// Darsni yangilash
router.patch(
  "/:id",
  protect,
  adminOnly,
  validate(updateLessonSchema),
  updateLesson
);


router.delete(
  "/:id",
  protect,
  adminOnly,
  validate(lessonIdSchema),
  deleteLesson
);

export default router;
