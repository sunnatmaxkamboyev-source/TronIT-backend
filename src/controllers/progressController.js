import mongoose from "mongoose";
import Progress from "../models/Progress.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";


export const completeLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID noto'g'ri",
      });
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      isPublished: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Dars topilmadi",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course,
      status: "active",
      paymentStatus: { $in: ["free", "paid"] },
    });

    if (!enrollment && !lesson.isFree) {
      return res.status(403).json({
        success: false,
        message: "Bu darsni ko'rish uchun kursga yozilishingiz kerak",
      });
    }

    const progress = await Progress.findOneAndUpdate(
      {
        student: req.user._id,
        lesson: lessonId,
      },
      {
        $set: {
          course: lesson.course,
          isCompleted: true,
          completedAt: new Date(),
          lastWatchedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Dars tugallandi",
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// Dars ko'rish vaqtini va oxirgi pozitsiyani saqlash
export const updateLessonProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { lastPosition, watchTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID noto'g'ri",
      });
    }

    const position = Number(lastPosition);
    const watched = Number(watchTime);

    if (
      !Number.isFinite(position) ||
      !Number.isFinite(watched) ||
      position < 0 ||
      watched < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Video vaqti noto'g'ri",
      });
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      isPublished: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Dars topilmadi",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course,
      status: "active",
      paymentStatus: { $in: ["free", "paid"] },
    });

    if (!enrollment && !lesson.isFree) {
      return res.status(403).json({
        success: false,
        message: "Bu darsga kirish huquqingiz yo'q",
      });
    }

    const progress = await Progress.findOneAndUpdate(
      {
        student: req.user._id,
        lesson: lessonId,
      },
      {
        $set: {
          course: lesson.course,
          lastPosition: position,
          watchTime: watched,
          lastWatchedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Dars davomati saqlandi",
      progress,
    });
  } catch (error) {
    next(error);
  }
};


export const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course ID noto'g'ri",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      status: "active",
      paymentStatus: { $in: ["free", "paid"] },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Siz bu kursga faol yozilmagansiz",
      });
    }

    const totalLessons = await Lesson.countDocuments({
      course: courseId,
      isPublished: true,
    });

    const completedLessons = await Progress.countDocuments({
      student: req.user._id,
      course: courseId,
      isCompleted: true,
    });

    const progress = await Progress.find({
      student: req.user._id,
      course: courseId,
    }).populate("lesson", "title order duration");

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    res.status(200).json({
      success: true,
      courseId,
      totalLessons,
      completedLessons,
      remainingLessons: totalLessons - completedLessons,
      percentage,
      progress,
    });
  } catch (error) {
    next(error);
  }
};


export const getMyProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({
      student: req.user._id,
    })
      .populate("course", "title slug thumbnail")
      .populate("lesson", "title order duration")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      total: progress.length,
      progress,
    });
  } catch (error) {
    next(error);
  }
};
