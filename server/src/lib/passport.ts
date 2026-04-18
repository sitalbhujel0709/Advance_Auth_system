import 'dotenv/config';
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { prisma } from './prisma.js';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackBaseUrl =
  process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? "5000"}`;
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ?? `${callbackBaseUrl}/api/auth/google/callback`;

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables");
}

passport.use(
  new Strategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if(!email){
          return done(new Error("No email found in Google profile"))
        }
        const existingUser = await prisma.account.findUnique({
          where: {
            provider_providerAccountId:{
              provider:"google",
              providerAccountId: profile.id
            }
          },
          include:{
            user: true
          }
        })
        if(existingUser){
          return done(null,existingUser.user)
        }

        let user = await prisma.user.findUnique({ where: { email } });
        if(!user){
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value ?? null,
              isVerified: true
            }
          })
        }
        await prisma.account.create({
          data: {
            userId: user.id,
            provider: "google",
            providerAccountId: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken
          }
        })
        return done(null,user)
      } catch (error) {
        done(error as Error)
      }
    }
  )
)

export default passport;