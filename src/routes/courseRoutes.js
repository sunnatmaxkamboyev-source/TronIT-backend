
import express from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  createCourseSchema,
  updateCourseSchema,
} from "../validators/courseValidator.js";

const router = express.Router();

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourseById);

// Admin routes
router.post(
  "/",
  protect,
  adminOnly,
  validate(createCourseSchema),
  createCourse
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  validate(updateCourseSchema),
  updateCourse
);

router.delete("/:id", protect, adminOnly, deleteCourse);

export default router;
