import mongoose from "mongoose";
import Category from "../models/Category.js";



export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, thumbnail, order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Kategoriya nomi kiritilishi shart",
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Bu kategoriya allaqachon mavjud",
      });
    }

    const category = await Category.create({
      name,
      description,
      icon,
      thumbnail,
      order: Number(order) || 0,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Kategoriya yaratildi",
      category,
    });
  } catch (error) {
    next(error);
  }
};



export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({
      order: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      total: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};



export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Category ID noto'g'ri",
      });
    }

    const category = await Category.findOne({
      _id: id,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategoriya topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};



export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Category ID noto'g'ri",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "icon",
      "thumbnail",
      "order",
      "isActive",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.order !== undefined) {
      updates.order = Number(updates.order);

      if (!Number.isFinite(updates.order)) {
        return res.status(400).json({
          success: false,
          message: "Order qiymati noto'g'ri",
        });
      }
    }

    if (updates.name) {
      const existingCategory = await Category.findOne({
        name: updates.name.trim(),
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Bu nomdagi kategoriya mavjud",
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategoriya topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kategoriya yangilandi",
      category,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Category ID noto'g'ri",
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategoriya topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kategoriya deaktivatsiya qilindi",
    });
  } catch (error) {
    next(error);
  }
};
