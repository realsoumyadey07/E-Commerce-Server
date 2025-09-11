import mongoose, { Model, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  product_name: string;
  category_id: string;
  price: number;
  description: string;
  quantity: number;
  product_image: string;
  image_public_id: string;
}

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    category_id: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
    },
    product_image: {
      type: String,
      required: true,
    },
    image_public_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({
  product_name: "text",
  description: "text"
});

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
