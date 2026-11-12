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

const app = express();


app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);


app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Juda ko'p so'rov yuborildi. Keyinroq urinib ko'ring.",
  },
});

app.use("/api", apiLimiter);


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TronIT API ishlayapti 🚀",
    environment: process.env.NODE_ENV,
  });
});


if (process.env.NODE_ENV === "development") {
  app.post("/api/debug/body", (req, res) => {
    res.status(200).json({
      success: true,
      bodyReceived: req.body !== undefined,
      contentType: req.headers["content-type"],
      body: req.body,
    });
  });
}


app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/student", studentRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `${req.method} ${req.originalUrl} topilmadi`,
  });
});


app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "JSON formati noto'g'ri",
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message?.includes("Faqat MP4")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Serverda ichki xatolik yuz berdi"
        : err.message,
  });
});

export default app;
