import { Router } from "express";
import userRouter from "./modules/user/user.route.js";

const router:Router = Router();

router.use('/users',userRouter);

export default router;