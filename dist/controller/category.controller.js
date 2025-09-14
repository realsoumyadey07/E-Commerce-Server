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
exports.updateCategory = exports.getCategoryById = exports.searchCategory = exports.getAllCategories = exports.createCategory = void 0;
const asyncerror_middleware_1 = require("../middlewares/asyncerror.middleware");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = require("../utils/cloudinary");
const category_model_1 = require("../models/category.model");
const mongoose_1 = __importDefault(require("mongoose"));
exports.createCategory = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { category_name } = req.body;
    if (!category_name) {
        return next(new ErrorHandler_1.default("Please provide category name", 400));
    }
    const categoryExists = yield category_model_1.Category.findOne({ category_name });
    if (categoryExists) {
        return next(new ErrorHandler_1.default("Category is already present!", 400));
    }
    if (!req.files || req.files.length < 4) {
        return next(new ErrorHandler_1.default("At least 4 images are required!", 400));
    }
    const files = req.files;
    // Upload to Cloudinary
    const uploadResults = yield Promise.all(files.map((file) => (0, cloudinary_1.uploadOnCloudinary)(file.path)));
    // Check if any upload failed
    if (uploadResults.some((result) => result === null)) {
        return next(new ErrorHandler_1.default("One or more images failed to upload", 500));
    }
    // Map results into { url, public_id } format
    const categoryImages = uploadResults.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
    }));
    try {
        const newCategory = yield category_model_1.Category.create({
            category_name,
            category_images: categoryImages,
        });
        return res.status(201).json({
            success: true,
            category: newCategory,
            message: "New category has been created!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message || "Failed to save product category!", 500));
    }
}));
exports.getAllCategories = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield category_model_1.Category.find().select("-createdAt -updatedAt -__v");
        return res.status(200).json({
            success: true,
            categories: response,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message || "Error while fetching all categories", 500));
    }
}));
exports.searchCategory = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const searchKey = (req.query.searchKey || "").trim();
    if (!searchKey)
        return next(new ErrorHandler_1.default("search key is required!", 400));
    try {
        const category = yield category_model_1.Category.find({
            category_name: {
                $regex: searchKey,
                $options: "i",
            },
        });
        return res.status(200).json({
            success: true,
            category,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error === null || error === void 0 ? void 0 : error.message, 500));
    }
}));
exports.getCategoryById = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    if (!categoryId)
        return next(new ErrorHandler_1.default("category id is required!", 400));
    if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
        return next(new ErrorHandler_1.default("Invalid product id format!", 400));
    }
    try {
        const category = yield category_model_1.Category.findById(categoryId);
        if (!category)
            return next(new ErrorHandler_1.default("category not found!", 404));
        return res.status(200).json({
            success: true,
            category,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error === null || error === void 0 ? void 0 : error.message, 500));
    }
}));
exports.updateCategory = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { categoryId } = req.params;
    if (!categoryId) {
        return next(new ErrorHandler_1.default("category id is required!", 400));
    }
    try {
        const categoryExists = yield category_model_1.Category.findById(categoryId);
        if (!categoryExists) {
            return next(new ErrorHandler_1.default("category doesn't exist", 404));
        }
        const { category_name } = req.body;
        // clone old images
        let updatedImages = [...categoryExists.category_images];
        // loop through each slot
        const imageFields = ["image1", "image2", "image3", "image4"];
        for (let i = 0; i < imageFields.length; i++) {
            const field = imageFields[i];
            const file = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a[field]) === null || _b === void 0 ? void 0 : _b[0];
            if (file) {
                // delete old image if exists
                if ((_c = updatedImages[i]) === null || _c === void 0 ? void 0 : _c.public_id) {
                    yield (0, cloudinary_1.deleteFromCloudinary)(updatedImages[i].public_id);
                }
                // upload new image
                const uploadedResult = yield (0, cloudinary_1.uploadOnCloudinary)(file.path);
                if ((uploadedResult === null || uploadedResult === void 0 ? void 0 : uploadedResult.secure_url) && (uploadedResult === null || uploadedResult === void 0 ? void 0 : uploadedResult.public_id)) {
                    if (updatedImages[i] &&
                        typeof updatedImages[i].set === "function") {
                        updatedImages[i].set({
                            url: uploadedResult.secure_url,
                            public_id: uploadedResult.public_id,
                        });
                    }
                    else {
                        updatedImages[i] = {
                            url: uploadedResult.secure_url,
                            public_id: uploadedResult.public_id,
                        };
                    }
                }
            }
        }
        // update name if provided
        if (category_name) {
            categoryExists.category_name = category_name;
        }
        categoryExists.category_images.splice(0, categoryExists.category_images.length, ...updatedImages);
        yield categoryExists.save();
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: categoryExists,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error === null || error === void 0 ? void 0 : error.message, 500));
    }
}));
