
import { Router } from "express";

import {
  uploadLesson,
  getLessons,
  getLessonById,
  streamLessonVideo,
} from "../controllers/lessonController.js";

import upload from "../middlewares/uploadMiddleware.js";

import {
  protect,
  adminOnly,
} from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", getLessons);

router.get("/:id", getLessonById);


router.get("/:id/video", protect, streamLessonVideo);

 
router.post(
  "/upload",
  protect,
  adminOnly,
  upload.single("video"),
  uploadLesson
);

export default router;
