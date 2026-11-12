
import express from "express";

import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/authValidator.js";

const router = express.Router();


router.post("/register", validate(registerSchema), register);


router.post("/login", validate(loginSchema), login);


router.post("/logout", protect, logout);


router.get("/me", protect, getMe);

export default router;
