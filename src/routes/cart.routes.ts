import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { addToCart, getAllCarts } from "../controller/cart.controller";

const cartRouter = express.Router();

cartRouter.post("/add-cart", isAuthenticated, addToCart);
cartRouter.get("/all-carts", isAuthenticated, getAllCarts);

export default cartRouter;