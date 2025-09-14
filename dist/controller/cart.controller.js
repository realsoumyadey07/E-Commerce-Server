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
exports.deleteFromCart = exports.getAllCarts = exports.addToCart = void 0;
const asyncerror_middleware_1 = require("../middlewares/asyncerror.middleware");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const product_model_1 = require("../models/product.model");
const cart_model_1 = require("../models/cart.model");
const mongoose_1 = __importDefault(require("mongoose"));
exports.addToCart = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { productId } = req.body;
    if (!productId || !mongoose_1.default.Types.ObjectId.isValid(productId))
        return next(new ErrorHandler_1.default("invalid product id!", 400));
    const productExists = yield product_model_1.Product.findById(productId);
    if (!productExists)
        return next(new ErrorHandler_1.default("product dosn't exist", 404));
    const cartExists = yield cart_model_1.Cart.findOne({
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
        productId,
    });
    if (cartExists)
        return res.status(200).json({
            success: false,
            message: "cart already exists!",
        });
    const newCart = {
        userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
        productId,
        quantity: 1,
    };
    try {
        yield cart_model_1.Cart.create(newCart);
        res.status(200).json({
            success: true,
            message: "product has been added to cart!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) || "something went wrong while add to cart", 500));
    }
}));
exports.getAllCarts = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    try {
        const allCarts = yield cart_model_1.Cart.find({ userId })
            .populate("productId", "product_name price product_image")
            .lean();
        return res.status(200).json({
            success: true,
            carts: allCarts,
            message: allCarts.length
                ? "Carts fetched successfully"
                : "No items in the cart",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) || "something went wrong while add to cart", 500));
    }
}));
exports.deleteFromCart = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId } = req.body;
    if (!cartId || !mongoose_1.default.Types.ObjectId.isValid(cartId)) {
        return next(new ErrorHandler_1.default("cartId is required or invalid", 400));
    }
    try {
        const deletedCart = yield cart_model_1.Cart.findByIdAndDelete(cartId);
        if (!deletedCart) {
            return next(new ErrorHandler_1.default("Cart item doesn't exist", 404));
        }
        return res.status(200).json({
            success: true,
            product: deletedCart,
            message: "Product deleted successfully from cart",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) ||
            "Something went wrong while deleting product from cart!", 500));
    }
}));
