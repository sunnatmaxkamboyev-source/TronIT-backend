
import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

// O'quvchini kursga yozish
export const enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Kurs ID noto'g'ri",
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      status: "published",
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Kurs topilmadi yoki hali nashr qilinmagan",
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "Siz bu kursga avval yozilgansiz",
      });
    }

    const isFree = Number(course.price) === 0;

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      status: "active",
      paymentStatus: isFree ? "free" : "pending",
      amountPaid: 0,
    });

    if (isFree) {
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: 1 },
      });
    }

    res.status(201).json({
      success: true,
      message: isFree
        ? "Kursga muvaffaqiyatli yozildingiz"
        : "Kursga yozilish so'rovi yaratildi. To'lov kutilmoqda",
      enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Siz bu kursga avval yozilgansiz",
      });
    }

    next(error);
  }
};

// O'quvchining barcha kurslari
export const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
    })
      .populate("course", "title slug thumbnail level price status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: enrollments.length,
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// Bitta kursdagi yozilish ma'lumoti
export const getEnrollmentByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Kurs ID noto'g'ri",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    }).populate("course", "title slug thumbnail level");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Siz bu kursga yozilmagansiz",
      });
    }

    res.status(200).json({
      success: true,
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// Kursdan chiqish
export const cancelEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Kurs ID noto'g'ri",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Yozilish topilmadi",
      });
    }

    if (enrollment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Siz allaqachon kursdan chiqqansiz",
      });
    }

    enrollment.status = "cancelled";
    await enrollment.save();

    if (enrollment.paymentStatus === "free" ||
        enrollment.paymentStatus === "paid") {
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: -1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "Kursdan chiqdingiz",
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};
