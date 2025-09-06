import mongoose, { Model, Schema } from "mongoose";

export interface ICategory extends Document {
  category_name: string;
  category_images: string[];
}

const categorySchema = new Schema(
  {
    category_name: {
      type: String,
      required: true,
    },
    category_images: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);
