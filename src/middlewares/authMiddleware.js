import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// Foydalanuvchini autentifikatsiya qilish
export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.tronit_token;

    // Bearer token fallback
    if (
      !token &&
      req.headers.authorization?.startsWith("Bearer ")
    ) {
      token = req.headers.authorization
        .slice(7)
        .trim();
    }

    // Token mavjudligini tekshirish
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Tizimga kirishingiz kerak",
      });
    }

    // JWT_SECRET mavjudligini tekshirish
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET sozlanmagan");
    }

    // JWT tokenni tekshirish
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    // Token payload tekshiruvi
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.id !== "string" ||
      !mongoose.isValidObjectId(decoded.id)
    ) {
      return res.status(401).json({
        success: false,
        message: "Token ma'lumotlari noto'g'ri",
      });
    }

    // Foydalanuvchini bazadan olish
    const user = await User.findById(decoded.id)
      .select("-password");

    // Foydalanuvchi mavjudligi va faolligini tekshirish
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Akkaunt topilmadi yoki faol emas",
      });
    }

    // Request ichiga user biriktirish
    req.user = user;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Token yaroqsiz yoki muddati tugagan",
      });
    }

    next(error);
  }
};

// Faqat admin uchun
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Tizimga kirishingiz kerak",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bu amal faqat admin uchun",
    });
  }

  next();
};
