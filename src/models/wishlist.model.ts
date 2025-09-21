import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IWishlist extends Document {
  userId: Schema.Types.ObjectId;
  products: Schema.Types.ObjectId[];
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

wishlistSchema.index({
    user: 1
}, {
    unique: true
});

export const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", wishlistSchema);
