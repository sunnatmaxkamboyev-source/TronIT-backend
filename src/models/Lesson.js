
import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    url: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["pdf", "document", "link", "other"],
      default: "other",
    },
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Dars nomi kiritilishi shart"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    video: {
      filename: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        required: true,
        maxlength: 255,
      },
      path: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
        min: 1,
      },
      mimetype: {
        type: String,
        enum: ["video/mp4"],
        default: "video/mp4",
      },
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
      max: 86400,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Dars tartib raqami butun son bo'lishi kerak",
      },
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    resources: {
      type: [resourceSchema],
      default: [],
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


lessonSchema.index(
  { course: 1, order: 1 },
  { unique: true }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
