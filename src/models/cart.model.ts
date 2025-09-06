import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IProduct } from "./product.model";

interface ICart extends Document {
    cart_user: IUser;
    cart_product: IProduct;
    quantity: number;
    total_amout: number;
}

const cartSchema = new Schema({
    cart_user: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    cart_product: {
        type: Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total_amount: {
        type: Number,
        require: true,
        default: "00"
    }
}, {timestamps: true});

export const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);