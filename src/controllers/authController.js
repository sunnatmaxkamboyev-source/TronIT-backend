import User from "../models/User.js";
import jwt from "jsonwebtoken";


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


export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body || {};

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Barcha majburiy maydonlarni to'ldiring",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Bu email allaqachon ro'yxatdan o'tgan",
      });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
    });

    return sendToken(user, 201, res);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bu email allaqachon ro'yxatdan o'tgan",
      });
    }

    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email va parolni to'g'ri kiriting",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email yoki parol noto'g'ri",
      });
    }

    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Email yoki parol noto'g'ri",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Akkauntingiz vaqtincha bloklangan",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    return sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};


export const logout = (req, res) => {
  res.clearCookie("tronit_token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Tizimdan muvaffaqiyatli chiqdingiz",
  });
};


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
