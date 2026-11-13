import { Router } from "express";

import {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getDashboardStats,
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly,
} from "../middlewares/authMiddleware.js";

import validate from "../middlewares/validateMiddleware.js";

import {
  getAllUsersSchema,
  getUserByIdSchema,
  toggleUserStatusSchema,
  getDashboardStatsSchema,
} from "../validators/adminValidator.js";

const router = Router();

router.use(protect, adminOnly);


router.get(
  "/stats",
  validate(getDashboardStatsSchema),
  getDashboardStats
);


router.get(
  "/users",
  validate(getAllUsersSchema),
  getAllUsers
);


router.get(
  "/users/:id",
  validate(getUserByIdSchema),
  getUserById
);


router.patch(
  "/users/:id/status",
  validate(toggleUserStatusSchema),
  toggleUserStatus
);

export default router;
