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
        return res
          .status(404)
          .json({ success: false, message: "address not found!" });
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

export const updateAddress = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { addressId } = req.body;
    try {
      const myAddress = await Address.findById(addressId);
      if (!myAddress) {
        return next(new ErrorHandler("address not found!", 404));
      }
      if (myAddress.userId.toString() !== userId?.toString()) {
        return next(
          new ErrorHandler("you are not authorized to update this address", 403)
        );
      }
      if (req.body.name && req.body.name !== myAddress.name)
        myAddress.name = req.body.name;
      if (
        req.body.phoneNumber &&
        req.body.phoneNumber !== myAddress.phoneNumber
      )
        myAddress.phoneNumber = req.body.phoneNumber;
      if (req.body.pincode && req.body.pincode !== myAddress.pincode)
        myAddress.pincode = req.body.pincode;
      if (req.body.locality && req.body.locality !== myAddress.locality)
        myAddress.locality = req.body.locality;
      if (req.body.area && req.body.area !== myAddress.area)
        myAddress.area = req.body.area;
      if (req.body.city && req.body.city !== myAddress.city)
        myAddress.city = req.body.city;
      if (req.body.district && req.body.district !== myAddress.district)
        myAddress.district = req.body.district;
      if (req.body.state && req.body.state !== myAddress.state)
        myAddress.state = req.body.state;
      if (req.body.landmark && req.body.landmark !== myAddress.landmark)
        myAddress.landmark = req.body.landmark;
      if (req.body.addressType && req.body.addressType !== myAddress.landmark)
        myAddress.addressType = req.body.addressType;
      const updatedAddress = await myAddress.save();
      return res.status(200).json({
        success: true,
        message: "address updated successfully!",
        address: updatedAddress,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          error?.message || "something went wrong while updating address",
          500
        )
      );
    }
  }
);
