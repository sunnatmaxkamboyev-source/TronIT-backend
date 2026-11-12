import mongoose from "mongoose";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Progress from "../models/Progress.js";

// O'quvchi profilini ko'rish
export const getStudentProfile = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};

// Profilni yangilash
export const updateStudentProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const updates = {};

    if (firstName !== undefined) {
      if (!firstName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Ism bo'sh bo'lmasligi kerak",
        });
      }
      updates.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (!lastName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Familiya bo'sh bo'lmasligi kerak",
        });
      }
      updates.lastName = lastName.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Yangilash uchun ma'lumot yuborilmadi",
      });
    }

    const student = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profil yangilandi",
      student,
    });
  } catch (error) {
    next(error);
  }
};

// O'quvchining kurslari
export const getStudentCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
      status: "active",
      paymentStatus: { $in: ["free", "paid"] },
    })
      .populate("course", "title slug thumbnail level totalLessons")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: enrollments.length,
      courses: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// O'quvchining umumiy statistikasi
export const getStudentStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const [enrolledCourses, completedLessons, totalProgress] =
      await Promise.all([
        Enrollment.countDocuments({
          student: studentId,
          status: "active",
          paymentStatus: { $in: ["free", "paid"] },
        }),

        Progress.countDocuments({
          student: studentId,
          isCompleted: true,
        }),

        Progress.countDocuments({
          student: studentId,
        }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        enrolledCourses,
        completedLessons,
        trackedLessons: totalProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student hisobini o'chirish
export const deleteStudentAccount = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Admin hisobini ushbu endpoint orqali o'chirishga ruxsat yo'q
    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin hisobini bu endpoint orqali o'chirib bo'lmaydi",
      });
    }

    await Promise.all([
      Enrollment.deleteMany({ student: studentId }),
      Progress.deleteMany({ student: studentId }),
      User.findByIdAndDelete(studentId),
    ]);

    res.clearCookie("tronit_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Hisobingiz va unga tegishli ma'lumotlar o'chirildi",
    });
  } catch (error) {
    next(error);
  }
};
