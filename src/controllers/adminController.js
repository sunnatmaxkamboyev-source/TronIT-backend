import User from "../models/User.js";
import Course from "../models/Course.js";
import Category from "../models/Category.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Progress from "../models/Progress.js";


export const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const search = req.query.search?.trim();

    const filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

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


export const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive true yoki false bo'lishi kerak",
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "O'zingizning akkauntingizni bloklay olmaysiz",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: isActive
        ? "Foydalanuvchi faollashtirildi"
        : "Foydalanuvchi bloklandi",
      user,
    });
  } catch (error) {
    next(error);
  }
};


export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalCategories,
      totalLessons,
      totalEnrollments,
      completedLessons,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Category.countDocuments(),
      Lesson.countDocuments(),
      Enrollment.countDocuments(),
      Progress.countDocuments({ isCompleted: true }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalCourses,
        publishedCourses,
        totalCategories,
        totalLessons,
        totalEnrollments,
        completedLessons,
      },
    });
  } catch (error) {
    next(error);
  }
};
