"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const ErrorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong!";
    // wrong mongodb id
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid! ${err.path}`;
        err = new ErrorHandler_1.default(message, 404);
    }
    //duplicate key!
    if (err.code === 11000) {
        const message = `Duplicate key: ${err.path} entered!`;
        err = new ErrorHandler_1.default(message, 409);
    }
    // duplicate key
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token! try again";
        err = new ErrorHandler_1.default(message, 401);
    }
    //JWT expired error
    if (err.name === "TokenExpiredError") {
        const message = "Json web token is expired!";
        err = new ErrorHandler_1.default(message, 401);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.ErrorMiddleware = ErrorMiddleware;
