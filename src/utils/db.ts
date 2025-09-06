import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const url = process.env.DATABASE_URL || "";

const connectDb = async ()=> {
    try {
        const response = await mongoose.connect(url);
        console.log(`Databse is connected to: ${response.connection.host}`);
    } catch (error: any) {
        console.log(error.message);
          setTimeout(connectDb, 5000);
    }
}

export default connectDb;