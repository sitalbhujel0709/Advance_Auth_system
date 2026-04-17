import type { Request, Response } from "express"
import { UserService } from "./user.service.js"
import { userRegisterSchema, userSignInSchema } from "./user.schema.js";

export class UserController  {
  private userService = new UserService();
  registerUser = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const user = await this.userService.registerUser((req as any).validated);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error registering user:", error instanceof Error ? error.message : "Unknown error");
      return res.status(500).json({
        message: error instanceof Error ? error.message : "An unexpected error occurred while registering the user"
      })
    }
  }

  signInUser = async (req:Request,res:Response):Promise<void | Response> => {
    
    try {
      const {accessToken} = await this.userService.signInUser((req as any).validated);
      console.log("Generated access token:",accessToken)
      res.cookie("accessToken",accessToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000
      })
      res.status(200).json({message:"User signed in successfully"})
    } catch (error) {
      console.error("Login error: ",error instanceof Error ? error.message : error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Internal Server Error"
      })
    }
  }

  verifyEmail = async (req:Request,res:Response):Promise<void|Response> => {
    try {
      const {email,otp} = req.body;
       await this.userService.verifyEmail(email,otp);
      res.status(200).json({message:"Email verified successfully"})
    } catch (error) {
      console.error("Email verification error: ",error instanceof Error ? error.message : error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Internal Server Error"
      })
    }
  }
  logOut = async (_:Request,res:Response):Promise<void|Response> => {
    try {
      res.clearCookie("accessToken");
      res.status(200).json({message:"User logged out successfully"})
    } catch (error) {
      console.error("Logout error: ",error instanceof Error ? error.message : error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Internal Server Error"
      })
    }
  }
  getUserProfile = async (req:Request,res:Response):Promise<void | Response> => {
    const userId = (req as any).user.userId;
    console.log("Fetching profile for userId: ",userId);
    try {
      const user = await this.userService.getUserById(userId);
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user profile: ",error instanceof Error ? error.message : error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Internal Server Error"
      })
    }
  }
}