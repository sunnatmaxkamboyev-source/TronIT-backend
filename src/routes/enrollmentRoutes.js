import { Router } from "express";

import {
  enrollCourse,
  getMyEnrollments,
  getEnrollmentByCourse,
  cancelEnrollment,
} from "../controllers/enrollmentController.js";

import { protect } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  enrollCourseSchema,
  getMyEnrollmentsSchema,
  getEnrollmentByCourseSchema,
  cancelEnrollmentSchema,
} from "../validators/enrollmentValidator.js";

const router = Router();

router.use(protect);

// Kursga yozilish
router.post(
  "/",
  validate(enrollCourseSchema),
  enrollCourse
);

// O'quvchining barcha kurslari
router.get(
  "/my-courses",
  validate(getMyEnrollmentsSchema),
  getMyEnrollments
);

// Bitta kursdagi enrollment
router.get(
  "/:courseId",
  validate(getEnrollmentByCourseSchema),
  getEnrollmentByCourse
);

// Kursdan chiqish
router.patch(
  "/:courseId/cancel",
  validate(cancelEnrollmentSchema),
  cancelEnrollment
);

export default router;
