import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Ism kiritilishi shart"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: [true, "Familiya kiritilishi shart"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email kiritilishi shart"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Email formati noto'g'ri",
      ],
    },

    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
      minlength: 8,
      maxlength: 128,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    avatar: {
      type: String,
      default: "",
      maxlength: 500,
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      maxlength: 20,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationCodeHash: {
      type: String,
      default: undefined,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },

    emailVerificationAttempts: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },

    emailVerificationResendAt: {
      type: Date,
      default: null,
      select: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Password comparison
userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
