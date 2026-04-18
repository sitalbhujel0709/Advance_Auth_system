import { Router } from "express";
import userRouter from "./modules/user/user.route.js";
import passport from "passport";
import { generateAccessToken, generateRefreshToken } from "./lib/utils/jwt.js";
import { prisma } from "./lib/prisma.js";


const router:Router = Router();

router.use('/users',userRouter);

router.get('/auth/google',passport.authenticate('google',{scope: ['profile','email']}))

router.get('/auth/google/callback',passport.authenticate('google',{
	session: false,
	failureRedirect: `${process.env.CLIENT_URL ?? "http://localhost:3000"}/signin?error=oauth_failed`
}),
	async (req,res)=>{
		const user = req.user as { id: string; role: "ADMIN" | "USER" };

		const accessToken = generateAccessToken({userId: user.id , role: user.role});
		const refreshToken = generateRefreshToken({userId: user.id , role: user.role});

		await prisma.session.create({
			data: {
				userId: user.id,
				refreshToken,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			}
		})

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 1000
		})
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000
		})

		return res.redirect(`${process.env.CLIENT_URL ?? "http://localhost:3000"}/`)
	}
)


export default router;