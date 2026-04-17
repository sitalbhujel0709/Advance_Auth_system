import { Router } from "express";
import { UserController } from "./user.controller.js";
import { validate } from "../../middleware/validate.js";
import { userRegisterSchema, userSignInSchema } from "./user.schema.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const userRouter:Router = Router(); 

const userController = new UserController();

userRouter.post("/register",validate(userRegisterSchema),userController.registerUser);
userRouter.post("/signin",validate(userSignInSchema),userController.signInUser);
userRouter.post("/verify",userController.verifyEmail);
userRouter.post("/logout",requireAuth,userController.logOut)
userRouter.get("/refresh",userController.refreshAccessToken)
userRouter.get("/profile",requireAuth,userController.getUserProfile)

export default userRouter;