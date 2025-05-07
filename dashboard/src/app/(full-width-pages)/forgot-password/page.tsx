"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import apiClient from "@/lib/apiClient"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      setErrorMessage("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // Call your password reset API
      const response = await apiClient.post("/auth/forgot-password", { email })
      
      if (response.status >= 200 && response.status < 300) {
        setStatus("success")
        toast.success("Password reset link sent to your email")
      } else {
        setStatus("error")
        setErrorMessage(response.data?.message || "Failed to send reset link")
        toast.error(response.data?.message || "Failed to send reset link")
      }
    } catch (error: unknown) {
      setStatus("error")
    
      let errorMsg = "Something went wrong. Please try again."
    
      if (error instanceof Error) {
      
        const axiosError = error as { response?: { data?: { message?: string } } }
        errorMsg = axiosError.response?.data?.message || error.message || errorMsg
      }
    
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
    }
     finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>
         
          {` Enter your email address and we'll send you a link to reset your password`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                If an account exists with the email <span className="font-medium">{email}</span>, you will receive a
                password reset link shortly.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={status === "error" ? "border-red-500" : ""}
                  disabled={isSubmitting}
                  required
                />
                {status === "error" && <p className="text-sm text-red-500">{errorMessage}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <Link href="/signin" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}