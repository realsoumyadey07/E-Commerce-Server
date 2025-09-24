import mongoose, { Schema, model, InferSchemaType, Model } from "mongoose";

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
    is_header: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export type ICategory = InferSchemaType<typeof categorySchema>;

export const Category: Model<ICategory> =
  mongoose.models.Category || model<ICategory>("Category", categorySchema);
