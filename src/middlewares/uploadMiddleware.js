
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = path.resolve("uploads/videos");


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Fayl saqlash
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}.mp4`;
    cb(null, uniqueName);
  },
});

// Fayl formatini tekshirish
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    extension !== ".mp4" ||
    file.mimetype !== "video/mp4"
  ) {
    return cb(
      new Error("Faqat MP4 formatidagi videolar qabul qilinadi!")
    );
  }

  cb(null, true);
};

// Multer konfiguratsiyasi
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024,
    files: 1,
    fields: 20,
    parts: 21,
  },
});

export default upload;
