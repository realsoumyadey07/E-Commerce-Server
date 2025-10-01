import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/asyncerror.middleware";
import ErrorHandler from "../utils/ErrorHandler";
import { Product } from "../models/product.model";
import { Cart } from "../models/cart.model";
import mongoose from "mongoose";

export const addToCart = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId))
      return next(new ErrorHandler("invalid product id!", 400));
    const productExists = await Product.findById(productId);
    if (!productExists)
      return next(new ErrorHandler("product dosn't exist", 404));
    const cartExists = await Cart.findOne({
      userId: req.user?._id,
      productId,
    });
    if (cartExists)
      return res.status(200).json({
        success: false,
        message: "cart already exists!",
      });
    const newCart = {
      userId: req.user?._id,
      productId,
      quantity: 1,
    };
    try {
      await Cart.create(newCart);
      res.status(200).json({
        success: true,
        message: "product has been added to cart!",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while add to cart",
          500
        )
      );
    }
  }
);

export const getAllCarts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    try {
      const allCarts = await Cart.find({ userId })
        .populate("productId", "product_name price images")
        .lean();
      return res.status(200).json({
        success: true,
        carts: allCarts,
        message: allCarts.length
          ? "Carts fetched successfully"
          : "No items in the cart",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while add to cart",
          500
        )
      );
    }
  }
);

export const deleteFromCart = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cartId } = req.body;

    if (!cartId || !mongoose.Types.ObjectId.isValid(cartId)) {
      return next(new ErrorHandler("cartId is required or invalid", 400));
    }

    try {
      const deletedCart = await Cart.findByIdAndDelete(cartId);

      if (!deletedCart) {
        return next(new ErrorHandler("Cart item doesn't exist", 404));
      }

      return res.status(200).json({
        success: true,
        product: deletedCart,
        message: "Product deleted successfully from cart",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message ||
            "Something went wrong while deleting product from cart!",
          500
        )
      );
    }
  }
);

