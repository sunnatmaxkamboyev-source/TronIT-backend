import express from "express";
import rateLimit from "express-rate-limit";

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


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring.",
  },
});


const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Ro'yxatdan o'tish urinishlari limiti tugadi. Keyinroq urinib ko'ring.",
  },
});


router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  register
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
