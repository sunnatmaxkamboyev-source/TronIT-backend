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
    },

    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
      minlength: 8,
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
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
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


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
