import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { addAddress, getMyAddress, updateAddress } from "../controller/address.controller";

const addressRouter = express.Router();

addressRouter.post("/add-address", isAuthenticated, addAddress);
addressRouter.get("/get-my-address", isAuthenticated, getMyAddress);
addressRouter.patch("/update-my-address", isAuthenticated, updateAddress);

export default addressRouter;