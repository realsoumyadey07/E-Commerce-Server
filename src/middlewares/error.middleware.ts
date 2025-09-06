import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Something went wrong!";

  // wrong mongodb id
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid! ${err.path}`;
    err = new ErrorHandler(message, 404);
  }

  //duplicate key!
  if (err.code === 11000) {
    const message = `Duplicate key: ${err.path} entered!`;
    err = new ErrorHandler(message, 409);
  }

  // duplicate key
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token! try again";
    err = new ErrorHandler(message, 401);
  }

  //JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "Json web token is expired!";
    err = new ErrorHandler(message, 401);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
