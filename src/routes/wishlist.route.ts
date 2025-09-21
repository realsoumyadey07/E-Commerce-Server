import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { addToWishlist, getAllWishlisted } from "../controller/wishlist.controller";

const wishlistRouter = express.Router();

wishlistRouter.post("/add-to-wishlist", isAuthenticated, addToWishlist);
wishlistRouter.get("/get-my-wishlists", isAuthenticated, getAllWishlisted);

export default wishlistRouter;