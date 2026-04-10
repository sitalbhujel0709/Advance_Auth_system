import * as z from 'zod';

const emailRule = z.string().email({message: "Invalid email address"});
const passwordRule = z.string().min(8, {message: "Password must be at least 8 characters long"}).regex(/[A-Z]/, {message: "Password must contain at least one uppercase letter"}).regex(/[a-z]/, {message: "Password must contain at least one lowercase letter"}).regex(/[0-9]/, {message: "Password must contain at least one number"}).regex(/[@$!%*?&]/, {message: "Password must contain at least one special character"});

export const userRegisterSchema = z.object({
  email: emailRule,
  password: passwordRule,
  fullName: z.string().min(2, {message: "Full name must be at least 2 characters long"}),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  avatarUrl: z.string().url({message: "Invalid URL format"}).optional()
})

export const userSignInSchema = z.object({
  email:emailRule,
  password: passwordRule
})
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserSignInInput = z.infer<typeof userSignInSchema>;
