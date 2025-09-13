import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { cancelOrder, createOrder } from "../controller/order.controller";

const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.post("/cancel-order", isAuthenticated, cancelOrder);

export default orderRouter;