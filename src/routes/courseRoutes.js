import express from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getAdminCourses,
} from "../controllers/courseController.js";

import {
  protect,
  adminOnly,
} from "../middlewares/authMiddleware.js";

import validate from "../middlewares/validateMiddleware.js";

import {
  createCourseSchema,
  updateCourseSchema,
  deleteCourseSchema,
} from "../validators/courseValidator.js";

const router = express.Router();

// ==================================
// ADMIN ROUTES
// ==================================

// Admin barcha kurslarni oladi
// Bu route /:id dan oldin turishi shart
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminCourses
);

// ==================================
// PUBLIC ROUTES
// ==================================

router.get("/", getCourses);

router.get("/:id", getCourseById);

// ==================================
// ADMIN COURSE MANAGEMENT
// ==================================

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

router.delete(
  "/:id",
  protect,
  adminOnly,
  validate(deleteCourseSchema),
  deleteCourse
);

export default router;
