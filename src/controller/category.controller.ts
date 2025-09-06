import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/asyncerror.middleware";
import ErrorHandler from "../utils/ErrorHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { Category } from "../models/category.model";

interface ICreateCategory {
  category_name: string;
}

export const createCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category_name } = req.body as ICreateCategory;
    if (!category_name)
      return next(new ErrorHandler("Please provide category name", 400));
    const categoryExists = await Category.findOne({ category_name });
    if (categoryExists) {
      return next(new ErrorHandler("Category is already prasent!", 400));
    }
    if (!req.files || (req.files as Express.Multer.File[]).length < 4) {
      return next(new ErrorHandler("Atleast 4 images are required!", 400));
    }
    const files = req.files as Express.Multer.File[];
    
    const uploadResults = await Promise.all(
      files.map((file) => uploadOnCloudinary(file.path))
    );
    // const imageBase64 = files.map((file) => file.buffer.toString("base64"));
    if (uploadResults.some((result) => result === null)) {
      return next(new ErrorHandler("One or more images failed to upload", 500));
    }
    const imageUrls = uploadResults.map((result) => result!.secure_url);
    try {
      const product_category = {
        category_name,
        category_images: imageUrls,
      };
      const newCategory = await Category.create(product_category);
      return res.status(200).json({
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
      const response = await Category.find().select("-category_images -createdAt -updatedAt -__v");
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