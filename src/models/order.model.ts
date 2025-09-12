import mongoose, { Model, Schema, Types } from "mongoose";

export interface IOreder extends Document {
  userId: Types.ObjectId;
  products: {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "pending" | "shipped" | "delivered" | "paid" | "cancelled";
  paymentMethod: "cod" | "card" | "upi";
  paymentId?: string;
  shippingAddress: Types.ObjectId;
}

const orderSchema = new Schema<IOreder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi"],
      required: true,
    },
    paymentId: {
      type: String,
    },
    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
  },
  { timestamps: true }
);

export const Order: Model<IOreder> =
  mongoose.models.Order || mongoose.model<IOreder>("Order", orderSchema);
