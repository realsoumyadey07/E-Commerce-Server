"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const product_controller_1 = require("../controller/product.controller");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const productRouter = express_1.default.Router();
productRouter.post("/create-product", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorizeRoles)("admin"), multer_middleware_1.upload.single("product_image"), product_controller_1.createProduct);
productRouter.get("/get-all-products", product_controller_1.getAllProducts);
productRouter.get("/search-products", product_controller_1.searchProduct);
productRouter.get("/search", product_controller_1.userSearchProduct);
productRouter.get("/get-category-products", product_controller_1.getAllCategoryProducts);
productRouter.get("/product-details/:productId", product_controller_1.getProductById);
productRouter.patch("/edit-product/:productId", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorizeRoles)("admin"), multer_middleware_1.upload.single("product_image"), product_controller_1.updateProduct);
productRouter.delete("/delete-product/:productId", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorizeRoles)("admin"), product_controller_1.deleteProduct);
exports.default = productRouter;
