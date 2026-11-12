import { Router } from "express";

import {
  completeLesson,
  updateLessonProgress,
  getCourseProgress,
  getMyProgress,
} from "../controllers/progressController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);


router.get("/my-progress", getMyProgress);


router.get("/course/:courseId", getCourseProgress);


router.patch("/lesson/:lessonId/complete", completeLesson);

router.patch("/lesson/:lessonId", updateLessonProgress);

export default router;
