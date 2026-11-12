
import { Router } from "express";

import {
  getStudentProfile,
  updateStudentProfile,
  getStudentCourses,
  getStudentStats,
  deleteStudentAccount,
} from "../controllers/studentController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();


router.use(protect);


router.get("/profile", getStudentProfile);

router.patch("/profile", updateStudentProfile);


router.get("/courses", getStudentCourses);


router.get("/stats", getStudentStats);


router.delete("/account", deleteStudentAccount);

export default router;
