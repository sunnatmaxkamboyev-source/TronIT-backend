import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Security
app.disable("x-powered-by");
app.use(helmet());

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS: Origin ruxsat etilmagan"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers
app.use(express.json({ limit: "10kb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
    parameterLimit: 100,
  })
);

// Cookies
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Juda ko'p so'rov yuborildi. Keyinroq urinib ko'ring.",
  },
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Juda ko'p so'rov yuborildi. Keyinroq urinib ko'ring.",
    });
  },
});

app.use("/api", apiLimiter);

// Health check
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "TronIT API ishlayapti",
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `${req.method} ${req.originalUrl} topilmadi`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  if (res.headersSent) {
    return next(err);
  }

  // Invalid JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "JSON formati noto'g'ri",
    });
  }

  // Request body too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Yuborilgan ma'lumot hajmi juda katta",
    });
  }

  // Multer errors
  if (err.name === "MulterError") {
    const multerMessages = {
      LIMIT_FILE_SIZE: "Video hajmi 500 MB dan oshmasligi kerak",
      LIMIT_FILE_COUNT: "Faqat bitta video yuklash mumkin",
      LIMIT_UNEXPECTED_FILE: "Noto'g'ri fayl maydoni yuborildi",
      LIMIT_FIELD_COUNT: "Maydonlar soni chegaradan oshdi",
      LIMIT_PART_COUNT: "Yuborilgan qismlar soni chegaradan oshdi",
    };

    const statusCode =
      err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    return res.status(statusCode).json({
      success: false,
      message:
        multerMessages[err.code] ||
        "Fayl yuklashda xatolik yuz berdi",
    });
  }

  // File type and CORS errors
  if (
    err.message?.includes("Faqat MP4") ||
    err.message?.includes("ruxsat etilmagan")
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Ma'lumotlar validatsiyadan o'tmadi",
    });
  }

  // Invalid MongoDB ID
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Yuborilgan ID yoki qiymat noto'g'ri",
    });
  }

  // Duplicate value
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Bu ma'lumot bazada allaqachon mavjud",
    });
  }

  // Other errors
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode >= 500 ? 500 : statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Serverda ichki xatolik yuz berdi"
        : err.message,
  });
});

export default app;
