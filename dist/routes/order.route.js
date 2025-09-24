"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const order_controller_1 = require("../controller/order.controller");
const orderRouter = express_1.default.Router();
orderRouter.post("/create-order", auth_middleware_1.isAuthenticated, order_controller_1.createOrder);
orderRouter.post("/cancel-order", auth_middleware_1.isAuthenticated, order_controller_1.cancelOrder);
orderRouter.get("/my-orders", auth_middleware_1.isAuthenticated, order_controller_1.getMyOrders);
exports.default = orderRouter;
