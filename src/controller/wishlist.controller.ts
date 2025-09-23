import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/asyncerror.middleware";
import ErrorHandler from "../utils/ErrorHandler";
import mongoose from "mongoose";
import { Product } from "../models/product.model";
import { Wishlist } from "../models/wishlist.model";

export const addToWishlist = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { productId } = req.body;
    if (!productId) {
      return next(new ErrorHandler("product id is required!", 400));
    }
    if (!mongoose.Types.ObjectId.isValid(productId))
      return next(new ErrorHandler("invalid product id!", 400));
    try {
      const isValidProduct = await Product.findById(productId);
      if (!isValidProduct)
        return next(new ErrorHandler("product not found!", 404));
      let myWishlist = await Wishlist.findOne({ userId });
      if (!myWishlist)
        myWishlist = await Wishlist.create({
          userId,
          products: [],
        });
      if (myWishlist.products.includes(productId))
        return next(new ErrorHandler("product is already in wishlist!", 400));
      myWishlist.products.push(productId);
      await myWishlist.save();
      return res.status(200).json({
        success: true,
        message: "product added to wishlist!",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message ||
            "something went wrong while adding product to wishlist!",
          500
        )
      );
    }
  }
);

export const removeFromWishlist = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { productId } = req.body;
    try {
      const product = await Product.findById(productId);
      if (!product)
        return next(new ErrorHandler("product doesn't exists!", 404));
      const myWishlist = await Wishlist.findOne({
        userId,
      });
      if (!myWishlist)
        return next(new ErrorHandler("you don't have any wishlist!", 400));
      if (myWishlist.products.some((i) => i.toString() === productId))
        myWishlist.products = myWishlist.products.filter(
          (i) => i.toString() !== productId
        );
      await myWishlist.save();
      return res.status(200).json({
        success: true,
        message: "item got removed from wishlist!",
        wishlist: myWishlist,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message ||
            "something went wrong while removing from wishlist!",
          500
        )
      );
    }
  }
);

export const getAllWishlisted = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    try {
      const myWishlists = await Wishlist.find({
        userId,
      });
      return res.status(200).json({
        success: true,
        wishlists: myWishlists[0],
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while getting all wishlists!",
          500
        )
      );
    }
  }
);
