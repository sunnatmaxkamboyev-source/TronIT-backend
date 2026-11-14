
import User from "../models/User.js";
import jwt from "jsonwebtoken";

import {
  registerUser,
  verifyEmail as verifyEmailService,
  resendVerificationCode,
  loginUser,
} from "../services/authService.js";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET .env faylida mavjud emas");
  }

  return jwt.sign(
    { id: userId.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: "HS256",
    }
  );
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.cookie("tronit_token", token, {
    ...cookieOptions,
    maxAge: COOKIE_MAX_AGE,
  });

  const safeUser = user.toObject();
  delete safeUser.password;

  return res.status(statusCode).json({
    success: true,
    user: safeUser,
  });
};

// REGISTER
export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Tasdiqlash kodi emailingizga yuborildi",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res, next) => {
  try {
    const user = await verifyEmailService(req.body);

    return sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// RESEND VERIFICATION
export const resendVerification = async (req, res, next) => {
  try {
    const result = await resendVerificationCode(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const user = await loginUser(req.body);

    return sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("tronit_token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Tizimdan muvaffaqiyatli chiqdingiz",
  });
};

// GET ME
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
