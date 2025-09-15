import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import userRouter from "./routes/user.routes";
import connectDb from "./utils/db";
import categoryRouter from "./routes/category.routes";
import productRouter from "./routes/product.routes";
import cartRouter from "./routes/cart.routes";
import addressRouter from "./routes/address.route";

const app = express();
const PORT = process.env.PORT || 8000;

// const allowedOrigins =
//   process.env.NODE_ENV === "production"
//     ? [process.env.FRONTEND_URL!]
//     : [process.env.FRONTEND_URL_LOCAL!];


// app configuration
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(
  cors({
    origin: "https://jewellery-ecommerce-client.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  })
);

// demo routing
app.get("/", (req: Request, res: Response) => {
  return res.json({
    serverStatus: "Running",
    message: "Server is running 👋",
  });
});

// routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/address", addressRouter);

// Works in Express 5
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} is not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on: ${PORT}`);
  });
}).catch((err)=> {
    console.log("❌ Db connection failed!", err);
});
