"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, Loader2, LockKeyhole } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import apiClient from "@/lib/apiClient"

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const isPasswordValid = (password: string) => {
    return password.length >= 8
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setStatus("error")
      setErrorMessage("Invalid reset link. Please request a new password reset.")
      return
    }

    if (!isPasswordValid(password)) {
      setStatus("error")
      setErrorMessage("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setStatus("error")
      setErrorMessage("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      await apiClient.post("/auth/reset-password", { 
        token, 
        newPassword: password,
        confirmPassword 
      })

      setStatus("success")
    } catch (error: unknown) {
      setStatus("error")
    
      let errorMsg = "Something went wrong. Please try again."
    
      if (error && typeof error === "object" && "response" in error) {
        const err = error as {
          response?: { data?: { message?: string } }
          message?: string
        }
        errorMsg = err.response?.data?.message || err.message || errorMsg
      } else if (error instanceof Error) {
        errorMsg = error.message
      }
    
      setErrorMessage(errorMsg)
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create new password</CardTitle>
          <CardDescription>Enter your new password below to reset your account</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your password has been successfully reset. You can now log in with your new password.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Invalid reset link. Please request a new password reset.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={status === "error" ? "border-red-500 pr-10" : "pr-10"}
                    disabled={isSubmitting || !token}
                    required
                  />
                  <LockKeyhole className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={status === "error" ? "border-red-500 pr-10" : "pr-10"}
                    disabled={isSubmitting || !token}
                    required
                  />
                  <LockKeyhole className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                {status === "error" && <p className="text-sm text-red-500">{errorMessage}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !token}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <Link href="/signin" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {status === "success" ? "Go to login" : "Back to login"}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}