import { Router } from "express";

import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();


router.post("/register", register);
router.post("/login", login);


router.post("/logout", protect, logout);
router.get("/me", protect, getMe);


router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TronIT Auth Routes ishlayapti!",
  });
});

export default router;
