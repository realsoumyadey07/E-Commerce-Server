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
exports.getMyOrders = exports.cancelOrder = exports.createOrder = void 0;
const asyncerror_middleware_1 = require("../middlewares/asyncerror.middleware");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const address_model_1 = require("../models/address.model");
const product_model_1 = require("../models/product.model");
const order_model_1 = require("../models/order.model");
const mongoose_1 = __importDefault(require("mongoose"));
exports.createOrder = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { products, addressId, paymentMethod, paymentId } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0)
        return next(new ErrorHandler_1.default("products are required!", 400));
    if (!addressId)
        return next(new ErrorHandler_1.default("addressId is required!", 400));
    try {
        const validAddress = yield address_model_1.Address.findOne({
            _id: addressId,
            userId,
        });
        if (!validAddress || validAddress.userId !== userId) {
            return next(new ErrorHandler_1.default("invalid addressId!", 404));
        }
        if (!paymentMethod)
            return next(new ErrorHandler_1.default("payment method is required!", 400));
        const shippingAddress = yield address_model_1.Address.findOne({
            _id: addressId,
            userId,
        });
        if (!shippingAddress)
            return next(new ErrorHandler_1.default("Invalid or unauthorized address!", 400));
        let totalAmount = 0;
        const orderProducts = [];
        for (const item of products) {
            const product = yield product_model_1.Product.findById(item.productId);
            if (!product)
                return next(new ErrorHandler_1.default("product not found!", 404));
            if (product.quantity < item.quantity)
                return next(new ErrorHandler_1.default(`Insufficient stock for ${product.product_name}`, 400));
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;
            orderProducts.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
            });
            product.quantity -= item.quantity;
            yield product.save();
        }
        const order = yield order_model_1.Order.create({
            userId,
            products: orderProducts,
            totalAmount,
            paymentMethod,
            paymentId,
            addressId: addressId,
        });
        return res.status(200).json({
            success: true,
            order,
            message: "order successfully created!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) || "something went wrong while creating order!", 500));
    }
}));
exports.cancelOrder = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { orderId } = req.params;
    if (!orderId || !mongoose_1.default.Types.ObjectId.isValid(orderId)) {
        return next(new ErrorHandler_1.default("invalid orderId!", 400));
    }
    try {
        const order = yield order_model_1.Order.findOne({
            _id: orderId,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
        });
        if (!order) {
            return next(new ErrorHandler_1.default("order not found!", 404));
        }
        const nonCancellableStatuses = ["shipped", "paid", "delivered"];
        if (nonCancellableStatuses.includes(order.status)) {
            return res.status(403).json({
                success: false,
                message: `You cannot cancel this order because it is already ${order.status}`,
            });
        }
        if (order.status === "cancelled")
            return next(new ErrorHandler_1.default("order is already canceled!", 409));
        for (const item of order.products) {
            const product = yield product_model_1.Product.findById(item.productId);
            if (!product)
                return next(new ErrorHandler_1.default("product not found", 404));
            product.quantity += item.quantity;
            yield product.save();
        }
        order.status = "cancelled";
        yield order.save();
        return res.status(200).json({
            success: true,
            order,
            message: "order has been canceled successfully!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default((error === null || error === void 0 ? void 0 : error.message) || "something went wrong while canceling order", 500));
    }
}));
exports.getMyOrders = (0, asyncerror_middleware_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
}));
