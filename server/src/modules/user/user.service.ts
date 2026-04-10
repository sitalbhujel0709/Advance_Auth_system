import { email } from "zod";
import type { User } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { UserRegisterInput, UserSignInInput } from "./user.schema.js";
import bcrypt from 'bcrypt';
import { generateAccessToken } from "../../lib/utils/jwt.js";

export class UserService {
  private prisma = prisma;
  async registerUser(data: UserRegisterInput): Promise<User>{
    const hashedPassword = await bcrypt.hash(data.password,10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
        avatarUrl: data.avatarUrl ?? null
      }
    })
    return user;
  }

  async signInUser(data: UserSignInInput): Promise<{accessToken: string}> {
    const existingUser = await this.prisma.user.findUnique({
      where:{
        email:data.email
      }
    })
    if(!existingUser){
      throw new Error("User with is email doesnot exists")
    }
    const validatePassword  = await bcrypt.compare(data.password,existingUser.password)
    if(!validatePassword){
      throw new Error("Invalid credentials")
    }
    const accessToken = generateAccessToken({userId:existingUser.id,role:existingUser.role});

    return {accessToken}
  }
}