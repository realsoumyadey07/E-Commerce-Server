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
exports.getAllCategoryProducts = exports.userSearchProduct = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.searchProduct = exports.getAllProducts = exports.createProduct = void 0;
const asyncerror_middleware_1 = require("../middlewares/asyncerror.middleware");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = require("../utils/cloudinary");
const product_model_1 = require("../models/product.model");
const mongoose_1 = __importDefault(require("mongoose"));
exports.createProduct = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_name, category_id, price, description, quantity } = req.body;
    // validate user inputs
    if (!product_name || !category_id || !price || !description || !quantity) {
        return next(new ErrorHandler_1.default("All fields are required!", 400));
    }
    if (!req.file) {
        return next(new ErrorHandler_1.default("Product image is required!", 400));
    }
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
        return next(new ErrorHandler_1.default("Price must be a number!", 400));
    }
    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity)) {
        return next(new ErrorHandler_1.default("Quantity must be a number!", 400));
    }
    // upload to cloudinary
    const cloudinaryRes = yield (0, cloudinary_1.uploadOnCloudinary)(req.file.path);
    if (!cloudinaryRes) {
        return next(new ErrorHandler_1.default("Image upload failed", 500));
    }
    try {
        const product = {
            product_name,
            category_id,
            price,
            description,
            quantity,
            product_image: cloudinaryRes.secure_url,
            image_public_id: cloudinaryRes.public_id,
        };
        const newProduct = yield product_model_1.Product.create(product);
        return res.status(200).json({
            success: true,
            product: newProduct,
            message: "Product has been created successfully!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message || "Failed to save product!", 500));
    }
}));
exports.getAllProducts = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_model_1.Product.find().populate("category_id", "category_name");
        return res.status(200).json({
            success: true,
            products,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.searchProduct = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchKey } = req.query; // 👈 read from query
        if (!searchKey || typeof searchKey !== "string") {
            return next(new ErrorHandler_1.default("Provide a search key", 400));
        }
        const products = yield product_model_1.Product.find({
            product_name: {
                $regex: searchKey,
                $options: "i",
            },
        }).populate("category_id", "category_name");
        return res.status(200).json({
            success: true,
            products,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error === null || error === void 0 ? void 0 : error.message, 500));
    }
}));
exports.getProductById = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        if (!productId)
            return next(new ErrorHandler_1.default("product id is required!", 400));
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return next(new ErrorHandler_1.default("Invalid product id format!", 400));
        }
        const product = yield product_model_1.Product.findById(productId).select("-__v");
        if (!product)
            return next(new ErrorHandler_1.default("Product is not found!", 404));
        return res.status(200).json({
            success: true,
            product,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error === null || error === void 0 ? void 0 : error.message, 500));
    }
}));
exports.updateProduct = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        if (!productId)
            return next(new ErrorHandler_1.default("product id not found!", 400));
        const product = yield product_model_1.Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler_1.default("Product not found!", 404));
        }
        // Update text fields from FormData
        if (req.body.product_name)
            product.product_name = req.body.product_name;
        if (req.body.category_id)
            product.category_id = req.body.category_id;
        if (req.body.price)
            product.price = req.body.price;
        if (req.body.description)
            product.description = req.body.description;
        if (req.body.quantity)
            product.quantity = req.body.quantity;
        if (req.file) {
            if (product.image_public_id) {
                yield (0, cloudinary_1.deleteFromCloudinary)(product.image_public_id);
            }
            const cloudinaryRes = yield (0, cloudinary_1.uploadOnCloudinary)(req.file.path);
            if (!cloudinaryRes)
                return next(new ErrorHandler_1.default("Image upload failed!", 500));
            product.product_image = cloudinaryRes.secure_url;
            product.image_public_id = cloudinaryRes.public_id;
        }
        // Save and return
        const updatedProduct = yield product.save();
        return res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            product: updatedProduct,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error === null || error === void 0 ? void 0 : error.message, 500));
    }
}));
exports.deleteProduct = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    if (!productId) {
        return next(new ErrorHandler_1.default("Product id is required", 400));
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler_1.default("Invalid product id format!", 400));
    }
    // deleting image from cloudinary
    const productExists = yield product_model_1.Product.findByIdAndDelete(productId);
    if (!productExists)
        return next(new ErrorHandler_1.default("Product doesn't exist!", 404));
    if (productExists.image_public_id) {
        try {
            yield (0, cloudinary_1.deleteFromCloudinary)(productExists.image_public_id);
        }
        catch (error) {
            return next(new ErrorHandler_1.default("error while deleting image from cloudinary", 500));
        }
    }
    return res.status(200).json({
        success: true,
        message: "Product successfully deleted!",
    });
}));
exports.userSearchProduct = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchKey } = req.query;
    if (!searchKey || typeof searchKey !== "string") {
        return next(new ErrorHandler_1.default("search key is required!", 400));
    }
    let mongoQuery = {};
    const underMatch = searchKey.match(/under\s+(\d+)/i);
    if (underMatch) {
        const priceLimit = parseInt(underMatch[1], 10);
        mongoQuery.price = { $lte: priceLimit };
    }
    const aboveMatch = searchKey.match(/above\s+(\d+)/i);
    if (aboveMatch) {
        const priceLimit = parseInt(aboveMatch[1], 10);
        mongoQuery.price = Object.assign(Object.assign({}, mongoQuery.price), { $gte: priceLimit });
    }
    mongoQuery.$or = [
        {
            product_name: {
                $regex: searchKey,
                $options: "i",
            },
        },
        {
            description: {
                $regex: searchKey,
                $options: "i",
            },
        },
    ];
    try {
        const products = yield product_model_1.Product.find(mongoQuery).limit(20);
        return res.status(200).json({
            success: true,
            products,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) ||
            "something went wrong while fetching user serched product products", 500));
    }
}));
exports.getAllCategoryProducts = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.query;
    try {
        const products = yield product_model_1.Product.find({
            category_id: categoryId,
        });
        return res.status(200).json({
            success: true,
            products,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) ||
            "something went wrong while getting all products from category!", 500));
    }
}));
