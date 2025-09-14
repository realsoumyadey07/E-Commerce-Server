"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controller/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const userRouter = express_1.default.Router();
userRouter.post("/user-registration", user_controller_1.userRegistration);
userRouter.post("/user-login", user_controller_1.userLogin);
userRouter.get("/user-logout", auth_middleware_1.isAuthenticated, user_controller_1.userLogout);
userRouter.get("/user-profile", auth_middleware_1.isAuthenticated, user_controller_1.userProfile);
exports.default = userRouter;
