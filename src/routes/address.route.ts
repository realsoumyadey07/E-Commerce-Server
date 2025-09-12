import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { addAddress } from "../controller/address.controller";

const addressRouter = express.Router();

addressRouter.post("/add-address", isAuthenticated, addAddress);

export default addressRouter;