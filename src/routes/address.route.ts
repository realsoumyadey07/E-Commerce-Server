import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { addAddress, getMyAddress } from "../controller/address.controller";

const addressRouter = express.Router();

addressRouter.post("/add-address", isAuthenticated, addAddress);
addressRouter.get("/get-my-address", isAuthenticated, getMyAddress);

export default addressRouter;