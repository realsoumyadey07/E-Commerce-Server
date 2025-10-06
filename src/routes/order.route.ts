import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.middleware";
import { cancelOrder, createOrder, getAllOrders, getMyOrders } from "../controller/order.controller";

const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.post("/cancel-order", isAuthenticated, cancelOrder);
orderRouter.get("/my-orders", isAuthenticated, getMyOrders);

// for admin
orderRouter.get("/all-orders", isAuthenticated, authorizeRoles("admin"), getAllOrders);

export default orderRouter;