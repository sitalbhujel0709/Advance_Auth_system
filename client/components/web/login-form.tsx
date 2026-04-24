"use client"

import React from 'react'
import Link from 'next/link'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { UserSchema } from '@/Types/user.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiInstance } from '@/lib/config/axios'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const LoginSchema = UserSchema.pick({
	email: true,
	password: true,
})

type LoginFormInput = z.input<typeof LoginSchema>
type LoginFormOutput = z.output<typeof LoginSchema>

const LoginForm = () => {
	const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:5000'
	const router = useRouter();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormInput, unknown, LoginFormOutput>({
		resolver: zodResolver(LoginSchema),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const onSubmit = async (data: LoginFormOutput) => {
		try {
			const response = await apiInstance.post('/users/signin', data)

			if (response.status === 200) {
				toast.success('Signed in successfully')
				reset()
				router.replace('/')
			}
		} catch (error) {
			console.error('Error signing in user:', error)
			toast.error('Invalid credentials or sign in failed')
		}
	}

	return (
		<div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
			<div className="mb-6 space-y-1 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
				<p className="text-sm text-muted-foreground">
					Sign in to continue managing your account.
				</p>
			</div>

			<form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="email" className="text-sm font-medium">Email</label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						aria-invalid={!!errors.email}
						{...register('email')}
					/>
					{errors.email && (
						<p className="text-sm text-destructive">{errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<label htmlFor="password" className="text-sm font-medium">Password</label>
					<Input
						id="password"
						type="password"
						placeholder="Enter your password"
						aria-invalid={!!errors.password}
						{...register('password')}
					/>
					{errors.password && (
						<p className="text-sm text-destructive">{errors.password.message}</p>
					)}
				</div>

				<Button
					type="submit"
					className={cn('w-full')}
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>

			<div className="my-4 flex items-center gap-3">
				<div className="h-px flex-1 bg-border" />
				<span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
				<div className="h-px flex-1 bg-border" />
			</div>

			<Button asChild variant="outline" className="w-full">
				<a href={`${serverUrl}/api/auth/google`}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M21.35 11.1H12v2.98h5.35c-.23 1.51-1.79 4.43-5.35 4.43-3.22 0-5.85-2.66-5.85-5.94s2.63-5.94 5.85-5.94c1.83 0 3.06.78 3.76 1.45l2.57-2.49C16.71 4.06 14.57 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.65-3.65 8.65-8.79 0-.59-.07-1.04-.15-1.11z"
							fill="currentColor"
						/>
					</svg>
					Continue with Google
				</a>
			</Button>

			<p className="mt-4 text-center text-sm text-muted-foreground">
				Do not have an account?{' '}
				<Link href="/signup" className="font-medium text-primary hover:underline">
					Sign up
				</Link>
			</p>
		</div>
	)
}

export default LoginForm
