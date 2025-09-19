import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/asyncerror.middleware";
import ErrorHandler from "../utils/ErrorHandler";
import { Address } from "../models/address.model";
import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
import mongoose from "mongoose";

export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { products, addressId, paymentMethod, paymentId } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return next(new ErrorHandler("products are required!", 400));
    }
    if (!addressId) {
      return next(new ErrorHandler("addressId is required!", 400));
    }
    if (!paymentMethod) {
      return next(new ErrorHandler("payment method is required!", 400));
    }

    try {
      const address = await Address.findOne({ _id: addressId, userId });
      if (!address) {
        return next(new ErrorHandler("invalid addressId!", 404));
      }

      let totalAmount = 0;

      const orderProducts = await Promise.all(
        products.map(async (item) => {
          const product = await Product.findById(item.productId);
          if (!product) throw new ErrorHandler("product not found!", 404);

          if (product.quantity < item.quantity) {
            throw new ErrorHandler(
              `Insufficient stock for ${product.product_name}`,
              400
            );
          }

          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;

          product.quantity -= item.quantity;
          await product.save();

          return {
            productId: product._id,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );

      const order = await Order.create({
        userId,
        products: orderProducts,
        totalAmount,
        paymentMethod,
        paymentId,
        addressId,
      });

      return res.status(200).json({
        success: true,
        order,
        message: "order successfully created!",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while creating order!",
          500
        )
      );
    }
  }
);

export const cancelOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new ErrorHandler("invalid orderId!", 400));
    }
    try {
      const order = await Order.findOne({
        _id: orderId,
        userId: req.user?._id,
      });
      if (!order) {
        return next(new ErrorHandler("order not found!", 404));
      }
      const nonCancellableStatuses = ["shipped", "paid", "delivered"];
      if (nonCancellableStatuses.includes(order.status)) {
        return res.status(403).json({
          success: false,
          message: `You cannot cancel this order because it is already ${order.status}`,
        });
      }
      if (order.status === "cancelled")
        return next(new ErrorHandler("order is already canceled!", 409));

      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (!product) return next(new ErrorHandler("product not found", 404));
        product.quantity += item.quantity;
        await product.save();
      }
      order.status = "cancelled";
      await order.save();
      return res.status(200).json({
        success: true,
        order,
        message: "order has been canceled successfully!",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while canceling order",
          500
        )
      );
    }
  }
);

export const getMyOrders = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    try {
      const orders = await Order.find({ userId })
        .populate("products.productId", "product_name price product_image")
        .populate(
          "addressId",
          "name phoneNumber pincode locality area city district state landmark addressType"
        )
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while fetching orders",
          500
        )
      );
    }
  }
);
