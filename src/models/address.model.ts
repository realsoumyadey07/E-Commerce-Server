import mongoose, { Document, Model, Schema } from "mongoose";

interface IAddress extends Document {
    userId: Schema.Types.ObjectId;
    name: string;
    phoneNumber: string;
    pincode: string;
    locality: string;
    area: string;
    city: string;
    district: string;
    state: string;
    landmark: string;
    addressType: "home" | "work";
}

const addressSchema = new Schema<IAddress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    locality: {
        type: String,
        required: true,
        trim: true
    },
    area: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    landmark: {
        type: String,
        required: true,
        trim: true
    },
    addressType: {
        type: String,
        enum: ["home", "work"],
        required: true
    }
}, {timestamps: true});

addressSchema.index(
  { userId: 1, pincode: 1, locality: 1, area: 1 },
  { unique: true }
);


export const Address: Model<IAddress> = mongoose.models.Address || mongoose.model<IAddress>("Address", addressSchema);