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
exports.updateAddress = exports.getMyAddress = exports.addAddress = void 0;
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
exports.getMyAddress = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    try {
        const address = yield address_model_1.Address.findOne({ userId });
        if (!address) {
            return res
                .status(404)
                .json({ success: false, message: "address not found!" });
        }
        return res.status(200).json({
            success: true,
            address,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) || "something went wrong while getting address", 500));
    }
}));
exports.updateAddress = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { addressId } = req.body;
    try {
        const myAddress = yield address_model_1.Address.findById(addressId);
        if (!myAddress) {
            return next(new ErrorHandler_1.default("address not found!", 404));
        }
        if (myAddress.userId.toString() !== (userId === null || userId === void 0 ? void 0 : userId.toString())) {
            return next(new ErrorHandler_1.default("you are not authorized to update this address", 403));
        }
        if (req.body.name && req.body.name !== myAddress.name)
            myAddress.name = req.body.name;
        if (req.body.phoneNumber &&
            req.body.phoneNumber !== myAddress.phoneNumber)
            myAddress.phoneNumber = req.body.phoneNumber;
        if (req.body.pincode && req.body.pincode !== myAddress.pincode)
            myAddress.pincode = req.body.pincode;
        if (req.body.locality && req.body.locality !== myAddress.locality)
            myAddress.locality = req.body.locality;
        if (req.body.area && req.body.area !== myAddress.area)
            myAddress.area = req.body.area;
        if (req.body.city && req.body.city !== myAddress.city)
            myAddress.city = req.body.city;
        if (req.body.district && req.body.district !== myAddress.district)
            myAddress.district = req.body.district;
        if (req.body.state && req.body.state !== myAddress.state)
            myAddress.state = req.body.state;
        if (req.body.landmark && req.body.landmark !== myAddress.landmark)
            myAddress.landmark = req.body.landmark;
        if (req.body.addressType && req.body.addressType !== myAddress.landmark)
            myAddress.addressType = req.body.addressType;
        const updatedAddress = yield myAddress.save();
        return res.status(200).json({
            success: true,
            message: "address updated successfully!",
            address: updatedAddress,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) || "something went wrong while updating address", 500));
    }
}));
