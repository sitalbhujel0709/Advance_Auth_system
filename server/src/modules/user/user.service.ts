import type { User } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { UserRegisterInput, UserSignInInput } from "./user.schema.js";
import bcrypt from 'bcrypt';
import { generateAccessToken } from "../../lib/utils/jwt.js";
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

  async signInUser(data: UserSignInInput): Promise<{ accessToken: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email
      }
    })
    if (!existingUser) {
      throw new Error("User with is email doesnot exists")
    }
    const validatePassword = await bcrypt.compare(data.password, existingUser.password)
    if (!validatePassword) {
      throw new Error("Invalid credentials")
    }
    const accessToken = generateAccessToken({ userId: existingUser.id, role: existingUser.role });

    return { accessToken }
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
  async getUserById(id: string): Promise<Omit<User, "password"> | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User not found")
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}