"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userProfile = exports.userLogout = exports.userLogin = exports.userRegistration = void 0;
const asyncerror_middleware_1 = require("../middlewares/asyncerror.middleware");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const user_model_1 = require("../models/user.model");
exports.userRegistration = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if ([name, email, password].some((i) => i.trim() === "")) {
            return next(new ErrorHandler_1.default("Three fiels are required!", 400));
        }
        const userExists = yield user_model_1.User.findOne({ email });
        if (userExists) {
            return new ErrorHandler_1.default("User already exists", 400);
        }
        const user = yield user_model_1.User.create({
            name,
            email,
            password,
        });
        const createdUser = yield user_model_1.User.findById(user._id).select("-password -refresh_token");
        if (!createdUser) {
            return next(new ErrorHandler_1.default("Something went wrong while registering user!", 400));
        }
        return res.status(200).json({
            success: true,
            user: createdUser,
            message: "User created successfully!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.userLogin = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if ([email, password].some((i) => i.trim() === "")) {
            return next(new ErrorHandler_1.default("All fields are required!", 400));
        }
        const userExists = yield user_model_1.User.findOne({ email }).select("+password");
        if (!userExists) {
            return next(new ErrorHandler_1.default("Email is not correct!", 404));
        }
        const isMatched = yield userExists.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorHandler_1.default("Password is incorrect", 400));
        }
        const { access_token, refresh_token } = yield generateAccessAndRefreshToken(userExists._id);
        const loggedinUser = yield user_model_1.User.findById(userExists._id).select("-password -refresh_token");
        const cookiesOption = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        };
        res.cookie("access_token", access_token, cookiesOption);
        res.cookie("refresh_token", refresh_token, cookiesOption);
        return res.status(200).json({
            success: true,
            user: loggedinUser,
            message: "User loggedin successfully!",
            access_token,
            refresh_token,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message || "Something went wrong!", 500));
    }
}));
const generateAccessAndRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const access_token = user.signAccessToken();
        const refresh_token = user.signRefreshToken();
        user.refresh_token = refresh_token;
        yield (user === null || user === void 0 ? void 0 : user.save({
            validateBeforeSave: false,
        }));
        return {
            access_token,
            refresh_token,
        };
    }
    catch (error) {
        throw new Error(error.message ||
            "something went wrong while generating access and refresh token!");
    }
});
exports.userLogout = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield user_model_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, {
            $unset: {
                refresh_token: 1,
            },
        }, { new: true });
        const cookiesOption = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        };
        return res
            .status(200)
            .clearCookie("access_token", cookiesOption)
            .clearCookie("refresh_token", cookiesOption)
            .json({
            success: true,
            message: "User logout successfully!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.userProfile = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield user_model_1.User.findById(userId).select("-password -refresh_token");
        if (!user)
            return next(new ErrorHandler_1.default("User doesn't exists!", 404));
        return res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
