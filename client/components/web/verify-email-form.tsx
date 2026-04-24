"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiInstance } from '@/lib/config/axios'

const OTP_LENGTH = 6

const VerifyEmailForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get('email') ?? ''

  const [email] = useState(emailFromQuery)
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits])

  const maskedEmail = useMemo(() => {
    if (!email) return ''
    const [local, domain] = email.split('@')
    if (!local || !domain) return email
    if (local.length <= 2) return `${local[0] ?? ''}*@${domain}`
    return `${local[0]}${'*'.repeat(Math.max(local.length - 2, 1))}${local[local.length - 1]}@${domain}`
  }, [email])

  useEffect(() => {
    if (!email.trim()) {
      toast.error('Please sign up first to verify your email')
      router.replace('/signup')
    }
  }, [email, router])

  const focusInput = (index: number) => {
    const input = inputRefs.current[index]
    if (input) {
      input.focus()
      input.select()
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    if (!cleanValue) {
      setOtpDigits((prev) => {
        const next = [...prev]
        next[index] = ''
        return next
      })
      return
    }

    const digits = cleanValue.split('')
    setOtpDigits((prev) => {
      const next = [...prev]
      let currentIndex = index
      for (const digit of digits) {
        if (currentIndex >= OTP_LENGTH) break
        next[currentIndex] = digit
        currentIndex += 1
      }
      return next
    })

    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1)
    focusInput(nextIndex)
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      focusInput(index - 1)
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusInput(index - 1)
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusInput(index + 1)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedValue = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pastedValue) return

    const digits = pastedValue.slice(0, OTP_LENGTH).split('')
    setOtpDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < OTP_LENGTH; i += 1) {
        next[i] = digits[i] ?? ''
      }
      return next
    })

    focusInput(Math.min(digits.length, OTP_LENGTH - 1))
  }

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error('Email is required to verify your account')
      return
    }

    if (otpValue.length !== OTP_LENGTH) {
      toast.error('Please enter the 6-digit OTP')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiInstance.post('/users/verify', {
        email: email.trim(),
        otp: otpValue,
      })

      if (response.status === 200) {
        toast.success('Email verified successfully. You can sign in now.')
        router.replace('/signin')
      }
    } catch (error) {
      console.error('Error verifying email:', error)
      toast.error('Invalid OTP or verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to {maskedEmail || 'your email'}.
        </p>
      </div>

      <form noValidate onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">One-time password</label>
          <div className="grid grid-cols-6 gap-2">
            {otpDigits.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                className="h-12 text-center text-lg font-semibold tracking-widest"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Verifying...' : 'Verify Email'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Back to{' '}
        <Link href="/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default VerifyEmailForm
