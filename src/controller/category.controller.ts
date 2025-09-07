import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/asyncerror.middleware";
import ErrorHandler from "../utils/ErrorHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { Category } from "../models/category.model";
import mongoose from "mongoose";
import { url } from "inspector";

interface ICreateCategory {
  category_name: string;
}

export const createCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category_name } = req.body as ICreateCategory;

    if (!category_name) {
      return next(new ErrorHandler("Please provide category name", 400));
    }

    const categoryExists = await Category.findOne({ category_name });
    if (categoryExists) {
      return next(new ErrorHandler("Category is already present!", 400));
    }

    if (!req.files || (req.files as Express.Multer.File[]).length < 4) {
      return next(new ErrorHandler("At least 4 images are required!", 400));
    }

    const files = req.files as Express.Multer.File[];

    // Upload to Cloudinary
    const uploadResults = await Promise.all(
      files.map((file) => uploadOnCloudinary(file.path))
    );

    // Check if any upload failed
    if (uploadResults.some((result) => result === null)) {
      return next(new ErrorHandler("One or more images failed to upload", 500));
    }

    // Map results into { url, public_id } format
    const categoryImages = uploadResults.map((result) => ({
      url: result!.secure_url,
      public_id: result!.public_id,
    }));

    try {
      const newCategory = await Category.create({
        category_name,
        category_images: categoryImages,
      });

      return res.status(201).json({
        success: true,
        category: newCategory,
        message: "New category has been created!",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error.message || "Failed to save product category!",
          500
        )
      );
    }
  }
);

export const getAllCategories = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await Category.find().select(
        "-createdAt -updatedAt -__v"
      );
      return res.status(200).json({
        success: true,
        categories: response,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error.message || "Error while fetching all categories",
          500
        )
      );
    }
  }
);

export const searchCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchKey = ((req.query.searchKey as string) || "").trim();
    if (!searchKey)
      return next(new ErrorHandler("search key is required!", 400));
    try {
      const category = await Category.find({
        category_name: {
          $regex: searchKey,
          $options: "i",
        },
      });
      return res.status(200).json({
        success: true,
        category,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error?.message, 500));
    }
  }
);

export const getCategoryById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    if (!categoryId)
      return next(new ErrorHandler("category id is required!", 400));
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(new ErrorHandler("Invalid product id format!", 400));
    }
    try {
      const category = await Category.findById(categoryId);
      if (!category) return next(new ErrorHandler("category not found!", 404));
      return res.status(200).json({
        success: true,
        category,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error?.message, 500));
    }
  }
);

export const updateCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      return next(new ErrorHandler("category id is required!", 400));
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return next(new ErrorHandler("category doesn't exist", 404));
    }

    const { category_name } = req.body;

    // clone old images
    let updatedImages = [...categoryExists.category_images];

    // loop through each slot
    const imageFields = ["image1", "image2", "image3", "image4"] as const;

    for (let i = 0; i < imageFields.length; i++) {
      const field = imageFields[i];
      const file = (req.files as { [fieldname: string]: Express.Multer.File[] })?.[field]?.[0];

      if (file) {
        // delete old image if exists
        if (updatedImages[i]?.public_id) {
          await deleteFromCloudinary(updatedImages[i].public_id);
        }

        // upload new image
        const uploadedResult = await uploadOnCloudinary(file.path);
        if (uploadedResult?.secure_url && uploadedResult?.public_id) {
          updatedImages[i] = {
            url: uploadedResult.secure_url,
            public_id: uploadedResult.public_id,
          };
        }
      }
    }

    // update name if provided
    if (category_name) {
      categoryExists.category_name = category_name;
    }

    categoryExists.category_images = updatedImages;

    await categoryExists.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: categoryExists,
    });
  }
);


