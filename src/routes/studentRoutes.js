import { Router } from "express";

import {
  getStudentProfile,
  updateStudentProfile,
  getStudentCourses,
  getStudentStats,
  deleteStudentAccount,
} from "../controllers/studentController.js";

import { protect } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  getStudentProfileSchema,
  updateStudentProfileSchema,
  getStudentCoursesSchema,
  getStudentStatsSchema,
  deleteStudentAccountSchema,
} from "../validators/studentValidator.js";

const router = Router();

// Barcha endpointlar autentifikatsiyadan o'tadi
router.use(protect);

// Profil
router.get(
  "/profile",
  validate(getStudentProfileSchema),
  getStudentProfile
);

router.patch(
  "/profile",
  validate(updateStudentProfileSchema),
  updateStudentProfile
);

// Kurslar
router.get(
  "/courses",
  validate(getStudentCoursesSchema),
  getStudentCourses
);

// Statistika
router.get(
  "/stats",
  validate(getStudentStatsSchema),
  getStudentStats
);

// Hisobni o'chirish
router.delete(
  "/account",
  validate(deleteStudentAccountSchema),
  deleteStudentAccount
);

export default router;
