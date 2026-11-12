import { Router } from "express";

import {
  enrollCourse,
  getMyEnrollments,
  getEnrollmentByCourse,
  cancelEnrollment,
} from "../controllers/enrollmentController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();


router.use(protect);


router.post("/", enrollCourse);


router.get("/my-courses", getMyEnrollments);


router.get("/:courseId", getEnrollmentByCourse);


router.patch("/:courseId/cancel", cancelEnrollment);

export default router;
