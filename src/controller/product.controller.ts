import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/asyncerror.middleware";
import ErrorHandler from "../utils/ErrorHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { Product } from "../models/product.model";
import mongoose from "mongoose";

interface ICreateProductBody {
  product_name: string;
  category_id: string;
  price: number;
  description: string;
  quantity: Number;
}

export const createProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { product_name, category_id, price, description, quantity } =
      req.body as ICreateProductBody;
    // validate user inputs
    if (!product_name || !category_id || !price || !description || !quantity) {
      return next(new ErrorHandler("All fields are required!", 400));
    }
    // if (!req.files) {
    //   return next(new ErrorHandler("Product image is required!", 400));
    // }
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
      return next(new ErrorHandler("Price must be a number!", 400));
    }
    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity)) {
      return next(new ErrorHandler("Quantity must be a number!", 400));
    }
    if(!req.files || (req.files as Express.Multer.File[]).length < 4) {
      return next(new ErrorHandler("At least 4 images are required!", 400));
    }
    const files = req.files as Express.Multer.File[];
    // upload to cloudinary
    const uploadResults = await Promise.all(
      files.map((file)=> uploadOnCloudinary(file.path))
    );

    if(uploadResults.some((result)=> result === null)) {
      return next(new ErrorHandler("One or more images failed to upload", 500));
    }
    try {
      const product = {
        product_name,
        category_id,
        price,
        description,
        quantity,
        images: uploadResults.map(result=> ({
          url: result!.secure_url,
          public_id: result!.public_id
        }))
      };
      const newProduct = await Product.create(product);
      return res.status(200).json({
        success: true,
        product: newProduct,
        message: "Product has been created successfully!",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(error.message || "Failed to save product!", 500)
      );
    }
  }
);

export const getAllProducts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await Product.find().populate(
        "category_id",
        "category_name"
      );
      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const searchProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { searchKey } = req.query; // 👈 read from query
      if (!searchKey || typeof searchKey !== "string") {
        return next(new ErrorHandler("Provide a search key", 400));
      }
      const products = await Product.find({
        product_name: {
          $regex: searchKey,
          $options: "i",
        },
      }).populate("category_id", "category_name");
      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error?.message, 500));
    }
  }
);

export const getProductById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      if (!productId)
        return next(new ErrorHandler("product id is required!", 400));
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler("Invalid product id format!", 400));
      }
      const product = await Product.findById(productId).select("-__v");
      if (!product) return next(new ErrorHandler("Product is not found!", 404));
      return res.status(200).json({
        success: true,
        product,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error?.message, 500));
    }
  }
);

export const updateProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      if (!productId)
        return next(new ErrorHandler("product id not found!", 400));
      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found!", 404));
      }
      // Update text fields from FormData
      if (req.body.product_name) product.product_name = req.body.product_name;
      if (req.body.category_id) product.category_id = req.body.category_id;
      if (req.body.price) product.price = req.body.price;
      if (req.body.description) product.description = req.body.description;
      if (req.body.quantity) product.quantity = req.body.quantity;

      const updatedImages = [ ...product.images ];

      const imageFields = [ 'image1', 'image2', 'image3', 'image4' ];
            let imageUpdated = false;

      for(let i=0; i< imageFields.length;i++){
        const field = imageFields[i];
        const file = (
          req.files as { [fieldname: string] : Express.Multer.File[]}
        )?.[field]?.[0];

        if(file) {
          imageUpdated = true;
          if(updatedImages[i]?.public_id){
            await deleteFromCloudinary(updatedImages[i].public_id);
          }

          // upload new image
          const uploadedResult = await uploadOnCloudinary(file.path);
          if(uploadedResult){
            updatedImages[i] = {
              url: uploadedResult.secure_url,
              public_id: uploadedResult.public_id
            }
          }
        }
      }
      if(imageUpdated){
        product.images = updatedImages;
      }
      // Save and return
      const updatedProduct = await product.save();

      return res.status(200).json({
        success: true,
        message: "Product updated successfully!",
        product: updatedProduct,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error?.message, 500));
    }
  }
);

export const deleteProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    if (!productId) {
      return next(new ErrorHandler("Product id is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ErrorHandler("Invalid product id format!", 400));
    }

    // deleting image from cloudinary
    const productExists = await Product.findById(productId);
    if (!productExists)
      return next(new ErrorHandler("Product doesn't exist!", 404));
    for(const image of productExists.images) {
      if(image.public_id) {
        try {
          await deleteFromCloudinary(image.public_id);
        } catch (error: any) {
          return next(
          new ErrorHandler("error while deleting image from cloudinary", 500)
        );
        }
      }
    }

    await productExists.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product successfully deleted!",
    });
  }
);

export const userSearchProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { searchKey } = req.query;
    if (!searchKey || typeof searchKey !== "string") {
      return next(new ErrorHandler("search key is required!", 400));
    }
    let mongoQuery: any = {};
    const underMatch = searchKey.match(/under\s+(\d+)/i);
    if (underMatch) {
      const priceLimit = parseInt(underMatch[1], 10);
      mongoQuery.price = { $lte: priceLimit };
    }
    const aboveMatch = searchKey.match(/above\s+(\d+)/i);
    if (aboveMatch) {
      const priceLimit = parseInt(aboveMatch[1], 10);
      mongoQuery.price = { ...mongoQuery.price, $gte: priceLimit };
    }
    mongoQuery.$or = [
      {
        product_name: {
          $regex: searchKey,
          $options: "i",
        },
      },
      {
        description: {
          $regex: searchKey,
          $options: "i",
        },
      },
    ];
    try {
      const products = await Product.find(mongoQuery).limit(20);
      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message ||
            "something went wrong while fetching user serched product products",
          500
        )
      );
    }
  }
);

export const getAllCategoryProducts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.query;
    try {
      const products = await Product.find({
        category_id: categoryId,
      });
      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message ||
            "something went wrong while getting all products from category!",
          500
        )
      );
    }
  }
);
