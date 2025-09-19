import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { cancelOrder, createOrder, getMyOrders } from "../controller/order.controller";

const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.post("/cancel-order", isAuthenticated, cancelOrder);
orderRouter.get("/my-orders", isAuthenticated, getMyOrders);

export default orderRouter;