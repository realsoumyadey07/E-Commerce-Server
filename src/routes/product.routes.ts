import express from "express";
import {
  authorizeRoles,
  isAuthenticated,
} from "../middlewares/auth.middleware";
import { createProduct, deleteProduct, getAllProducts, getProductById, searchProduct, updateProduct, userSearchProduct } from "../controller/product.controller";
import { upload } from "../middlewares/multer.middleware";

const productRouter = express.Router();

productRouter.post(
  "/create-product",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.single("product_image"),
  createProduct
);
productRouter.get("/get-all-products", getAllProducts);
productRouter.get("/search-products", searchProduct);
productRouter.get("/search", userSearchProduct);
productRouter.get("/product-details/:productId", getProductById);
productRouter.patch("/edit-product/:productId", isAuthenticated, authorizeRoles("admin"), upload.single("product_image"), updateProduct);
productRouter.delete("/delete-product/:productId", isAuthenticated, authorizeRoles("admin"), deleteProduct);

export default productRouter;
