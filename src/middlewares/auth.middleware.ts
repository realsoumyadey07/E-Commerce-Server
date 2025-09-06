import dotenv from "dotenv";
dotenv.config();
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "./asyncerror.middleware";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return next(new ErrorHandler("Please login to access this resourse", 400));
    }
    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;
    if (!decoded) {
      return next(new ErrorHandler("Access token is not valid", 401));
    }

    const user = await User.findById(decoded?.id).select(
      "-password -refresh_token"
    );
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }
    req.user = user;
    next();
  }
);

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role ${req.user?.role} is not allowed to access this resourses`,
          400
        )
      );
    }
    next();
  };
};