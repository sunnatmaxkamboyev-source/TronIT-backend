
import express from "express";

import {
  uploadLesson,
  getLessons,
  getLessonById,
  streamLessonVideo,
} from "../controllers/lessonController.js";

import {
  protect,
  adminOnly,
} from "../middlewares/authMiddleware.js";

import upload from "../middlewares/uploadMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  createLessonSchema,
} from "../validators/lessonValidator.js";

const router = express.Router();

// Barcha darslarni olish
router.get("/", getLessons);

// Bitta darsni olish
router.get("/:id", getLessonById);

// Yangi dars va video yuklash
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("video"),
  validate(createLessonSchema),
  uploadLesson
);

// Video streaming
router.get("/:id/video", protect, streamLessonVideo);

export default router;
