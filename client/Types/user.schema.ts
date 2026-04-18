import {z} from "zod";

const passwordRule = z.string({ required_error: "Password is required" }).min(8, {message: "Password must be at least 8 characters long"}).regex(/[A-Z]/, {message: "Password must contain at least one uppercase letter"}).regex(/[a-z]/, {message: "Password must contain at least one lowercase letter"}).regex(/[0-9]/, {message: "Password must contain at least one number"}).regex(/[@$!%*?&]/, {message: "Password must contain at least one special character"});


export const UserSchema = z.object({
  fullName: z.string({ required_error: "Full name is required" }).trim().min(2, "Full name must be at least 2 characters long"),
  email: z.string({ required_error: "Email is required" }).trim().email("Invalid email address"),
  password: passwordRule,
  role: z.enum(["USER", "ADMIN"], { required_error: "Role is required" }).default("USER"),
  avatarUrl: z.string().url("Invalid URL format").optional(),
});
