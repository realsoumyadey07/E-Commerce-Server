import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;
    const response: UploadApiResponse = await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: "auto",
      }
    );
    console.log("File is uploaded on cloudinary!", response.url);
    await fs.unlink(localFilePath);
    return response;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    try {
      await fs.unlink(localFilePath);
    } catch (error: any) {
      console.error("Failed to delete temp file:", error);
    }
    return null;
  }
};

export const deleteFromCloudinary = async(publicId: string)=> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
}