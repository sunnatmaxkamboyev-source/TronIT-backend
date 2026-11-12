import User from "../models/User.js";
import jwt from "jsonwebtoken";


const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET .env faylida mavjud emas");
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};


const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.cookie("tronit_token", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    user,
  });
};


export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;


    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Barcha majburiy maydonlarni to'ldiring",
      });
    }

    
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email formati noto'g'ri",
      });
    }

    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak",
      });
    }

    
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

    sendToken(user, 201, res);
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email va parolni kiriting",
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


    const isPasswordCorrect = await user.comparePassword(password);

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

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};


export const logout = (req, res) => {
  res.clearCookie("tronit_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Tizimdan muvaffaqiyatli chiqdingiz",
  });
};


export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
