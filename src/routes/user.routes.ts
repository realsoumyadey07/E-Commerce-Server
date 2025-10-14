import express from "express";
import { getUserProfileById, userLogin, userLogout, userProfile, userRegistration } from "../controller/user.controller";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.middleware";

const userRouter = express.Router();

userRouter.post("/user-registration", userRegistration);
userRouter.post("/user-login", userLogin);
userRouter.get("/user-logout", isAuthenticated, userLogout);
userRouter.get("/user-profile", isAuthenticated, userProfile);

// for admin
userRouter.get("/get-user/:userId", isAuthenticated, authorizeRoles("admin"), getUserProfileById);

export default userRouter;