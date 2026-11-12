import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },

    watchTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastPosition: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

progressSchema.index(
  { student: 1, lesson: 1 },
  { unique: true }
);


progressSchema.index({ student: 1, course: 1 });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;