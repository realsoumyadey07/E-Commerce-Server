import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/asyncerror.middleware";
import ErrorHandler from "../utils/ErrorHandler";
import { User } from "../models/user.model";

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
}

export const userRegistration = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body as IRegistrationBody;
      if ([name, email, password].some((i) => i.trim() === "")) {
        return next(new ErrorHandler("Three fiels are required!", 400));
      }
      const userExists = await User.findOne({ email });
      if (userExists) {
        return new ErrorHandler("User already exists", 400);
      }
      const user = await User.create({
        name,
        email,
        password,
      });
      const createdUser = await User.findById(user._id).select(
        "-password -refresh_token"
      );
      if (!createdUser) {
        return next(
          new ErrorHandler("Something went wrong while registering user!", 400)
        );
      }
      return res.status(200).json({
        success: true,
        user: createdUser,
        message: "User created successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface ILoginBody {
  email: string;
  password: string;
}

interface ITokenOptions {
  expires?: Date;
  httpOnly: boolean;
  sameSite: "lax" | "none" | undefined;
  secure?: boolean;
  path: string;
}

export const userLogin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginBody;
      if ([email, password].some((i) => i.trim() === "")) {
        return next(new ErrorHandler("All fields are required!", 400));
      }
      const userExists = await User.findOne({ email }).select("+password");
      if (!userExists) {
        return next(new ErrorHandler("Email is not correct!", 404));
      }
      const isMatched = await userExists.comparePassword(password);
      if (!isMatched) {
        return next(new ErrorHandler("Password is incorrect", 400));
      }
      const { access_token, refresh_token } =
        await generateAccessAndRefreshToken(userExists._id as string);
      const loggedinUser = await User.findById(userExists._id).select(
        "-password -refresh_token"
      );

      const cookiesOption: ITokenOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      };
      res.cookie("access_token", access_token, cookiesOption);
      res.cookie("refresh_token", refresh_token, cookiesOption);
      return res.status(200).json({
        success: true,
        user: loggedinUser,
        message: "User loggedin successfully!",
        access_token,
        refresh_token,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(error.message || "Something went wrong!", 500)
      );
    }
  }
);

interface IGenerateAccessAndRefreshToken {
  access_token: string;
  refresh_token: string;
}

const generateAccessAndRefreshToken = async (
  userId: string
): Promise<IGenerateAccessAndRefreshToken> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const access_token = user.signAccessToken();
    const refresh_token = user.signRefreshToken();
    user.refresh_token = refresh_token;
    await user?.save({
      validateBeforeSave: false,
    });
    return {
      access_token,
      refresh_token,
    };
  } catch (error: any) {
    throw new Error(
      error.message ||
        "something went wrong while generating access and refresh token!"
    );
  }
};

export const userLogout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await User.findByIdAndUpdate(
        req.user?._id,
        {
          $unset: {
            refresh_token: 1,
          },
        },
        { new: true }
      );
      const cookiesOption: ITokenOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      };
      return res
        .status(200)
        .clearCookie("access_token", cookiesOption)
        .clearCookie("refresh_token", cookiesOption)
        .json({
          success: true,
          message: "User logout successfully!",
        });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const userProfile = CatchAsyncError(async(req: Request, res: Response, next: NextFunction)=> {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).select("-password -refresh_token");
    if(!user) return next(new ErrorHandler("User doesn't exists!", 404));
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});