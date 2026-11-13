import mongoose from "mongoose";

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
    title: {
      type: String,
      required: [true, "Kurs nomi kiritilishi shart"],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    shortDescription: {
      type: String,
      required: [true, "Qisqa tavsif kiritilishi shart"],
      trim: true,
      maxlength: 250,
    },

    description: {
      type: String,
      required: [true, "Kurs tavsifi kiritilishi shart"],
      trim: true,
      maxlength: 5000,
    },

    thumbnail: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    previewVideo: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    instructorName: {
      type: String,
      required: [true, "O'qituvchi ismi kiritilishi shart"],
      trim: true,
      maxlength: 100,
    },

    instructorAvatar: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Kategoriya tanlanishi shart"],
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    language: {
      type: String,
      enum: ["uz", "ru", "en"],
      default: "uz",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discountPrice: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator(value) {
          return value === null || value <= this.price;
        },
        message: "Chegirmali narx asosiy narxdan yuqori bo'lishi mumkin emas",
      },
    },

    tags: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    learningOutcomes: {
      type: [String],
      default: [],
    },

    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },

    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

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

// Slug yaratish
courseSchema.pre("validate", function () {
  if (this.isModified("title") && this.title) {
    this.slug = createSlug(this.title);
  }
});

// Indexes
courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ isFeatured: 1, status: 1 });
courseSchema.index({ title: "text", description: "text" });

const Course = mongoose.model("Course", courseSchema);

export default Course;
