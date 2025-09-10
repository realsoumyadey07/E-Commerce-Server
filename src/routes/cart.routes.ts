import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { addToCart } from "../controller/cart.controller";

const cartRouter = express.Router();

cartRouter.post("/add-cart", isAuthenticated, addToCart);

export default cartRouter;