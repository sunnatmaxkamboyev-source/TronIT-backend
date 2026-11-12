import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);


app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true, limit: "10kb"}));

app.use(cookieParser());

if (process.env.NODE_ENV === "development"){
    app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        success: false,
        message: "Juda ko'p so'rov yuborildi. Keyinroq qayta urinib ko'ring."
    }
})

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "TronIt API ishlamoqda!",
        timestamp: new Date().toISOString(),
    });
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Sahifa topilmadi",
    });
})


app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Serverda xatolik yuz berdi",
    })
})

export default app;