import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/categoryValidator.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.post(
  "/",
  protect,
  adminOnly,
  validate(createCategorySchema),
  createCategory
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  validate(updateCategorySchema),
  updateCategory
);

router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
