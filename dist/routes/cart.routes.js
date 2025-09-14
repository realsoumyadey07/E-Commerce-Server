"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const cart_controller_1 = require("../controller/cart.controller");
const cartRouter = express_1.default.Router();
cartRouter.post("/add-cart", auth_middleware_1.isAuthenticated, cart_controller_1.addToCart);
cartRouter.get("/all-carts", auth_middleware_1.isAuthenticated, cart_controller_1.getAllCarts);
cartRouter.delete("/delete-cart", auth_middleware_1.isAuthenticated, cart_controller_1.deleteFromCart);
exports.default = cartRouter;
