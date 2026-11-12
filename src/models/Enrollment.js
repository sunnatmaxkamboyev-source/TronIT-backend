    import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["free", "pending", "paid", "refunded"],
      default: "pending",
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);


enrollmentSchema.index({ student: 1, status: 1 });


enrollmentSchema.index({ course: 1, enrolledAt: -1 });

const Enrollment = mongoose.model(
  "Enrollment",
  enrollmentSchema
);

export default Enrollment;
