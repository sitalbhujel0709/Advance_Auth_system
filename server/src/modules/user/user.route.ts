import { Router } from "express";
import { UserController } from "./user.controller.js";
import { validate } from "../../middleware/validate.js";
import { userRegisterSchema, userSignInSchema } from "./user.schema.js";

const userRouter:Router = Router(); 

const userController = new UserController();

userRouter.post("/register",validate(userRegisterSchema),userController.registerUser);
userRouter.post("/signin",validate(userSignInSchema),userController.signInUser);
userRouter.post("/verify",userController.verifyEmail);

export default userRouter;