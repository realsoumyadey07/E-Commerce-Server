"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAddress = void 0;
const asyncerror_middleware_1 = require("../middlewares/asyncerror.middleware");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const address_model_1 = require("../models/address.model");
exports.addAddress = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { name, phoneNumber, pincode, locality, area, city, district, state, landmark, addressType, } = req.body;
    if ([
        name,
        phoneNumber,
        pincode,
        locality,
        area,
        city,
        district,
        state,
        landmark,
        addressType,
    ].some((i) => i === null || i === undefined || i === "")) {
        return next(new ErrorHandler_1.default("All fields are required!", 400));
    }
    try {
        const addressExists = yield address_model_1.Address.findOne({
            userId,
            name,
            pincode,
            locality,
            area,
        });
        if (addressExists)
            return next(new ErrorHandler_1.default("address already present", 400));
        const newAddress = yield address_model_1.Address.create({
            userId,
            name,
            phoneNumber,
            pincode,
            locality,
            area,
            city,
            district,
            state,
            landmark,
            addressType,
        });
        return res.status(201).json({
            success: true,
            address: newAddress,
            message: "address successfully created!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) || "something went wrong while adding address", 500));
    }
}));
