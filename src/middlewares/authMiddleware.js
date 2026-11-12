import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protect = async (req, res, next) => {
  try {
    let token;

   
    if (req.cookies?.tronit_token) {
      token = req.cookies.tronit_token;
    }

    
    if (
      !token &&
      req.headers.authorization?.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Tizimga kirishingiz kerak",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Akkaunt topilmadi yoki faol emas",
      });
    }

    
    req.user = user;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Token yaroqsiz yoki muddati tugagan",
      });
    }

    next(error);
  }
};


export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bu sahifaga faqat admin kira oladi",
    });
  }

  next();
};
