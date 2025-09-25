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
exports.getAllWishlisted = exports.removeFromWishlist = exports.addToWishlist = void 0;
const asyncerror_middleware_1 = require("../middlewares/asyncerror.middleware");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = require("../models/product.model");
const wishlist_model_1 = require("../models/wishlist.model");
exports.addToWishlist = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { productId } = req.body;
    if (!productId) {
        return next(new ErrorHandler_1.default("product id is required!", 400));
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(productId))
        return next(new ErrorHandler_1.default("invalid product id!", 400));
    try {
        const isValidProduct = yield product_model_1.Product.findById(productId);
        if (!isValidProduct)
            return next(new ErrorHandler_1.default("product not found!", 404));
        let myWishlist = yield wishlist_model_1.Wishlist.findOne({ userId });
        if (!myWishlist)
            myWishlist = yield wishlist_model_1.Wishlist.create({
                userId,
                products: [],
            });
        if (myWishlist.products.includes(productId))
            return next(new ErrorHandler_1.default("product is already in wishlist!", 400));
        myWishlist.products.push(productId);
        yield myWishlist.save();
        return res.status(200).json({
            success: true,
            message: "product added to wishlist!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) ||
            "something went wrong while adding product to wishlist!", 500));
    }
}));
exports.removeFromWishlist = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { productId } = req.body;
    try {
        const product = yield product_model_1.Product.findById(productId);
        if (!product)
            return next(new ErrorHandler_1.default("product doesn't exists!", 404));
        const myWishlist = yield wishlist_model_1.Wishlist.findOne({
            userId,
        });
        if (!myWishlist)
            return next(new ErrorHandler_1.default("you don't have any wishlist!", 400));
        if (myWishlist.products.some((i) => i.toString() === productId))
            myWishlist.products = myWishlist.products.filter((i) => i.toString() !== productId);
        yield myWishlist.save();
        return res.status(200).json({
            success: true,
            message: "item got removed from wishlist!",
            wishlist: myWishlist,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) ||
            "something went wrong while removing from wishlist!", 500));
    }
}));
exports.getAllWishlisted = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    try {
        const myWishlists = yield wishlist_model_1.Wishlist.find({
            userId,
        }).populate("products", "product_name price product_image");
        return res.status(200).json({
            success: true,
            wishlists: myWishlists[0],
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) || "something went wrong while getting all wishlists!", 500));
    }
}));
