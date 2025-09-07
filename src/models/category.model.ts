import mongoose, { Schema, model, InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    category_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category_images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export type ICategory = InferSchemaType<typeof categorySchema>;

export const Category =
  mongoose.models.Category || model<ICategory>("Category", categorySchema);
