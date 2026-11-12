import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    // Video fayl ma'lumotlari
    video: {
      filename: {
        type: String,
        required: true,
      },

      originalName: {
        type: String,
        required: true,
      },

      path: {
        type: String,
        required: true,
      },

      size: {
        type: Number,
        required: true,
      },

      mimetype: {
        type: String,
        default: "video/mp4",
      },
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["pdf", "document", "link", "other"],
          default: "other",
        },
      },
    ],

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