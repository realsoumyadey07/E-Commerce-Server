import express from "express";
import { userLogin, userLogout, userProfile, userRegistration } from "../controller/user.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";

const userRouter = express.Router();

userRouter.post("/user-registration", userRegistration);
userRouter.post("/user-login", userLogin);
userRouter.get("/user-logout", isAuthenticated, userLogout);
userRouter.get("/user-profile", isAuthenticated, userProfile);

export default userRouter;