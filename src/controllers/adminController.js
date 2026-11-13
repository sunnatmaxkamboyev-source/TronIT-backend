import User from "../models/User.js";
import Course from "../models/Course.js";
import Category from "../models/Category.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Progress from "../models/Progress.js";

// Barcha foydalanuvchilarni olish
export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search } = req.validated.query;

    const filter = {};

    if (search) {
      // Regex maxsus belgilarini oddiy matn sifatida qabul qilish
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { firstName: { $regex: escapedSearch, $options: "i" } },
        { lastName: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Bitta foydalanuvchini ID orqali olish
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.validated.params;

    const user = await User.findById(id).select("-password");

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

// Foydalanuvchini bloklash yoki faollashtirish
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.validated.params;
    const { isActive } = req.validated.body;

    // Admin o'z hisobini bloklay olmaydi
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "O'zingizning akkauntingizni bloklay olmaysiz",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      {
        new: true,
        runValidators: true,
      }
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

// Admin dashboard statistikasi
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

      User.countDocuments({
        isActive: true,
      }),

      Course.countDocuments(),

      Course.countDocuments({
        status: "published",
      }),

      Category.countDocuments(),

      Lesson.countDocuments(),

      Enrollment.countDocuments(),

      Progress.countDocuments({
        isCompleted: true,
      }),
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
