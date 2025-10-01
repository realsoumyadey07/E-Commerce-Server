import express from "express";
import {
  authorizeRoles,
  isAuthenticated,
} from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { createCategory, getAllCategories, getAllHeaderCategories, getCategoryById, searchCategory, updateCategory } from "../controller/category.controller";

const categoryRouter = express.Router();

categoryRouter.post(
  "/create-category",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.array("category_images", 4),
  createCategory
);
categoryRouter.get("/get-all-categories", getAllCategories);
categoryRouter.get("/get-all-header-categories", getAllHeaderCategories);
categoryRouter.get("/get-categoryById/:categoryId", getCategoryById);
categoryRouter.get("/search-categories", isAuthenticated, authorizeRoles("admin"), searchCategory);
categoryRouter.patch(
  "/edit-category/:categoryId",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateCategory
);


export default categoryRouter;