"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const address_controller_1 = require("../controller/address.controller");
const addressRouter = express_1.default.Router();
addressRouter.post("/add-address", auth_middleware_1.isAuthenticated, address_controller_1.addAddress);
exports.default = addressRouter;
