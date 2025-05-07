"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { UserCircle, Lock, LogIn } from "lucide-react"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"

// Define form types manually
type FormValues = {
  username: string
  password: string
  rememberMe: boolean
}

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: FormValues) {
    // Manual validation
    if (!values.username) {
      toast.error("Username is required")
      return
    }

    if (!values.password) {
      toast.error("Password is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.post("/auth/login", {
        user_name: values.username,
        password: values.password
      });

      if (!response.data.token) {
        throw new Error("Authentication failed: No token received")
      }

      const { token, user } = response.data

      if (values.rememberMe) {
        localStorage.setItem("authToken", token)
      } else {
        sessionStorage.setItem("authToken", token)
      }

      window.dispatchEvent(new Event("authChange"))
      router.push("/")
      toast.success(`Welcome back, ${user.first_name}!`)
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message)
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 to-teal-50">
      <div className="m-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#cbac70]">Welcome Back</h1>
            <p className="mt-2 text-gray-500">Sign in to your account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input className="pl-10" placeholder="Enter your username" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs font-medium text-[#cbac70] hover:text-[#042e62]">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            

              <Button type="submit" className="w-full bg-[#cbac70] hover:bg-[#042e62] hover:cursor-pointer" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">or</span>
            </div>
          </div>

         

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-[#cbac70] hover:text-[#042e62]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
