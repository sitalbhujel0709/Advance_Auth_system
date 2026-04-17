import type { User } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { UserRegisterInput, UserSignInInput } from "./user.schema.js";
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from "../../lib/utils/jwt.js";
import jwt from "jsonwebtoken";
import { transporter } from "../../lib/utils/otp.js";

export class UserService {
  private prisma = prisma;
  async registerUser(data: UserRegisterInput): Promise<Omit<User, "password">> {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
        avatarUrl: data.avatarUrl ?? null,
        otps: {
          create: {
            code: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
          }
        }
      }
    })
    transporter.sendMail({
      from: process.env.GOOGLE_APP_EMAIL!,
      to: data.email,
      subject: "Email Verification OTP",
      text: `Your OTP for email verification is: ${otp}. It will expire in 10 minutes.`
    }, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      }
    });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async signInUser(data: UserSignInInput): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email
      }
    })
    if (!existingUser) {
      throw new Error("User with is email doesnot exists")
    }
    const validatePassword = await bcrypt.compare(data.password, existingUser.password!)
    if (!validatePassword) {
      throw new Error("Invalid credentials")
    }
    const accessToken = generateAccessToken({ userId: existingUser.id, role: existingUser.role });
    const refreshToken = generateRefreshToken({ userId: existingUser.id, role: existingUser.role });

    await this.prisma.session.create({
      data: {
        userId: existingUser.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Refresh token expires in 7 days
      }
    })

    return { accessToken,refreshToken }
  }

  async verifyEmail(email: string, otp: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User with this email does not exist");
    }
    const Otp = await this.prisma.otp.findFirst({
      where: {
        userId: user.id,
      }
    });
    if (!Otp) {
      throw new Error("OTP not found for this user");
    }
    if (Otp.expiresAt < new Date()) {
      throw new Error("OTP has expired");
    }
    const isValidOtp = await bcrypt.compare(otp, Otp.code);
    if (!isValidOtp) {
      throw new Error("Invalid OTP");
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });
    await this.prisma.otp.delete({ where: { id: Otp.id } });


  }
  async logout(userId:string,refreshToken:string):Promise<void>{
    await this.prisma.session.deleteMany({
      where: {
        userId,
        refreshToken
      }
    })
  }
  async getUserById(id: string): Promise<Omit<User, "password"> | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User not found")
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refreshRefreshToken(refreshToken:string):Promise<{accessToken:string,newRefreshToken:string}>{
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY!);
    const session = await this.prisma.session.findFirst({
      where:{
        refreshToken,
        userId: (decoded as any).userId,
        expiresAt: {
          gt: new Date()
        }
      }
    })
    if(!session){
      throw new Error("Invalid refresh token")
    }
    const accessToken = generateAccessToken({userId: session.userId,role: (decoded as any).role});
    const newRefreshToken = generateRefreshToken({userId: session.userId,role: (decoded as any).role});

    await this.prisma.session.delete({
      where: {
        id: session.id
      }
    })

    await this.prisma.session.create({
      data: {
        userId: session.userId,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    
    return {accessToken,newRefreshToken}
  }
}