
import express from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerification,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../validators/authValidator.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/verify-email",
  verifyLimiter,
  validate(verifyEmailSchema),
  verifyEmail
);

router.post(
  "/resend-verification",
  resendLimiter,
  validate(resendVerificationSchema),
  resendVerification
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  login
);

router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
