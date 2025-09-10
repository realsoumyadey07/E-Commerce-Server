import mongoose, { Document, Schema, Types } from "mongoose";

interface ICart extends Document {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    quantity: number;
}

const cartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        required: true
    }
}, {timestamps: true});

export const Cart = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);