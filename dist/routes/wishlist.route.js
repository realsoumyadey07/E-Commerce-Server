"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const wishlist_controller_1 = require("../controller/wishlist.controller");
const wishlistRouter = express_1.default.Router();
wishlistRouter.post("/add-to-wishlist", auth_middleware_1.isAuthenticated, wishlist_controller_1.addToWishlist);
wishlistRouter.get("/get-my-wishlists", auth_middleware_1.isAuthenticated, wishlist_controller_1.getAllWishlisted);
wishlistRouter.delete("/remove-from-wishlist", auth_middleware_1.isAuthenticated, wishlist_controller_1.removeFromWishlist);
exports.default = wishlistRouter;
