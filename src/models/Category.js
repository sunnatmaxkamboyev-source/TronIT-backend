 import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Kategoriya nomi kiritilishi shart"],
      unique: true,
      trim: true,
      maxlength: 80,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    icon: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
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


categorySchema.pre("validate", function () {
  if (this.isModified("name") && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
});


categorySchema.index({ order: 1, name: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
