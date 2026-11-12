import { Router } from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();


router.get("/", getCourses);
router.get("/:id", getCourseById);


router.post("/", protect, adminOnly, createCourse);
router.patch("/:id", protect, adminOnly, updateCourse);
router.delete("/:id", protect, adminOnly, deleteCourse);

export default router;
