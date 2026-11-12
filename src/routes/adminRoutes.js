import express from "express";

import {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getDashboardStats,
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.use(protect, adminOnly);


router.get("/stats", getDashboardStats);


router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", toggleUserStatus);

export default router;
