import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/asyncerror.middleware";
import ErrorHandler from "../utils/ErrorHandler";
import { Address } from "../models/address.model";

export const addAddress = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const {
      name,
      phoneNumber,
      pincode,
      locality,
      area,
      city,
      district,
      state,
      landmark,
      addressType,
    } = req.body;
    if (
      [
        name,
        phoneNumber,
        pincode,
        locality,
        area,
        city,
        district,
        state,
        landmark,
        addressType,
      ].some((i) => i === null || i === undefined || i === "")
    ) {
      return next(new ErrorHandler("All fields are required!", 400));
    }

    try {
      const addressExists = await Address.findOne({
        userId,
        name,
        pincode,
        locality,
        area,
      });
      if (addressExists)
        return next(new ErrorHandler("address already present", 400));
      const newAddress = await Address.create({
        userId,
        name,
        phoneNumber,
        pincode,
        locality,
        area,
        city,
        district,
        state,
        landmark,
        addressType,
      });
      return res.status(201).json({
        success: true,
        address: newAddress,
        message: "address successfully created!",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while adding address",
          500
        )
      );
    }
  }
);

export const getMyAddress = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    try {
      const address = await Address.findOne({ userId });
      if (!address) {
        return res.status(404).json({ success: false, message: "address not found!" });
      }
      return res.status(200).json({
        success: true,
        address,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while getting address",
          500
        )
      );
    }
  }
);
