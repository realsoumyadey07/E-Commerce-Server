"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const category_controller_1 = require("../controller/category.controller");
const categoryRouter = express_1.default.Router();
categoryRouter.post("/create-category", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorizeRoles)("admin"), multer_middleware_1.upload.array("category_images", 4), category_controller_1.createCategory);
categoryRouter.get("/get-all-categories", category_controller_1.getAllCategories);
categoryRouter.get("/get-all-header-categories", category_controller_1.getAllHeaderCategories);
categoryRouter.get("/get-categoryById/:categoryId", category_controller_1.getCategoryById);
categoryRouter.get("/search-categories", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorizeRoles)("admin"), category_controller_1.searchCategory);
categoryRouter.patch("/edit-category/:categoryId", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorizeRoles)("admin"), multer_middleware_1.upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), category_controller_1.updateCategory);
exports.default = categoryRouter;
