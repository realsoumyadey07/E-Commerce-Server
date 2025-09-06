import express from "express";
import {
  authorizeRoles,
  isAuthenticated,
} from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { createCategory, getAllCategories, getCategoryById, searchCategory } from "../controller/category.controller";

const categoryRouter = express.Router();

categoryRouter.post(
  "/create-category",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.array("category_images", 4),
  createCategory
);
categoryRouter.get("/get-all-categories", getAllCategories);
categoryRouter.get("/get-categoryById/:categoryId", getCategoryById);
categoryRouter.get("/search-categories", isAuthenticated, authorizeRoles("admin"), searchCategory);

export default categoryRouter;