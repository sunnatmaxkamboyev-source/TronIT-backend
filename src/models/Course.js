import mongoose from "mongoose";

// Kurs nomidan slug yaratish
const createSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/o['ʻ’`]/g, "o")
    .replace(/g['ʻ’`]/g, "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const courseSchema = new mongoose.Schema(
  {
    // Kurs nomi
    title: {
      type: String,
      required: [true, "Kurs nomi kiritilishi shart"],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    // URL uchun slug
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Qisqa tavsif
    shortDescription: {
      type: String,
      required: [true, "Qisqa tavsif kiritilishi shart"],
      trim: true,
      maxlength: 250,
    },

    // To'liq tavsif
    description: {
      type: String,
      required: [true, "Kurs tavsifi kiritilishi shart"],
      trim: true,
      maxlength: 5000,
    },

    // Kurs rasmi
    thumbnail: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    // Kurs preview videosi
    previewVideo: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    // O'qituvchi
    instructorName: {
      type: String,
      required: [true, "O'qituvchi nomi kiritilishi shart"],
      trim: true,
      maxlength: 100,
    },

    instructorAvatar: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    // Kategoriya
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Kurs kategoriyasi tanlanishi shart"],
    },

    // Kurs darajasi
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    // Kurs tili
    language: {
      type: String,
      enum: ["uz", "ru", "en"],
      default: "uz",
    },

    // Narxi
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Chegirmali narx
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: function (value) {
          return value === null || value <= this.price;
        },
        message: "Chegirmali narx asl narxdan yuqori bo'lishi mumkin emas",
      },
    },

    // Teglar
    tags: {
      type: [String],
      default: [],
    },

    // Kurs uchun talablar
    requirements: {
      type: [String],
      default: [],
    },

    // O'quv natijalari
    learningOutcomes: {
      type: [String],
      default: [],
    },

    // Darslar soni
    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Umumiy davomiylik
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Kursga yozilganlar soni
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // O'rtacha reyting
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Reytinglar soni
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Kurs holati
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // Tavsiya etilgan kursmi?
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Kursni yaratgan admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Kurs nomi o'zgarsa slug ham yangilanadi
courseSchema.pre("validate", function () {
  if (this.isModified("title") && this.title) {
    this.slug = createSlug(this.title);
  }
});

// Oddiy indexlar
courseSchema.index({
  status: 1,
  createdAt: -1,
});

courseSchema.index({
  category: 1,
  status: 1,
});

courseSchema.index({
  isFeatured: 1,
  status: 1,
});

// TEXT INDEX
// language_override o'zgartirildi:
// MongoDB endi "language" maydonidagi "uz" qiymatini
// text index tili sifatida qabul qilmaydi.
courseSchema.index(
  {
    title: "text",
    description: "text",
  },
  {
    default_language: "none",
    language_override: "textLanguage",
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
