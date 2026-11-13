import { Router } from "express";

import {
  completeLesson,
  updateLessonProgress,
  getCourseProgress,
  getMyProgress,
} from "../controllers/progressController.js";

import { protect } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  completeLessonSchema,
  updateLessonProgressSchema,
  getCourseProgressSchema,
  getMyProgressSchema,
} from "../validators/progressValidator.js";

const router = Router();

router.use(protect);

// O'quvchining barcha progresslari
router.get(
  "/my-progress",
  validate(getMyProgressSchema),
  getMyProgress
);

// Kurs progressi
router.get(
  "/course/:courseId",
  validate(getCourseProgressSchema),
  getCourseProgress
);

// Darsni tugallash
router.patch(
  "/lesson/:lessonId/complete",
  validate(completeLessonSchema),
  completeLesson
);

// Video davomati va oxirgi pozitsiyani saqlash
router.patch(
  "/lesson/:lessonId",
  validate(updateLessonProgressSchema),
  updateLessonProgress
);

export default router;
