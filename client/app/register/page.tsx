"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UserPlus, Mail, Lock, User, UserCircle } from "lucide-react"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"

const formSchema = z
  .object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
    username: z.string().min(3, { message: "Username must be at least 3 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState<"buyer" | "seller">("buyer")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      // Send registration data to the backend
      const response = await apiClient.post("/auth/register", {
        first_name: values.firstName,
        last_name: values.lastName,
        user_name: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: accountType === "seller" ? "seller" : "buyer",
      });
      

      
      // Handle success response
      if (response.data === "User has been created. Please verify your email.") {
        toast.success("Almost there!", {
          duration: 8000,
          description: (
            <div className="flex flex-col space-y-2">
              <p>We've sent a verification link to <span className="font-semibold">{values.email}</span></p>
              <p>Please check your inbox and click the link to verify your email.</p>
            </div>
          ),
          className: "bg-green-500 text-white border-none",
        });
        
        // Clear form
        form.reset()
        
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle error response
      toast.error("Registration failed", {
        description: error.response?.data?.message || "Please try again.",
        className: "bg-red-500 text-white border-none",
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 to-teal-50">
      <div className="m-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center space-y-6 p-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#cbac70]">Create Account</h1>
              <p className="mt-2 text-gray-500">Join our community and start your journey today.</p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setAccountType("buyer")}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  accountType === "buyer"
                    ? "bg-[#cbac70] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setAccountType("seller")}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  accountType === "seller"
                    ? "bg-[#042e62] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Seller
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">or</span>
              </div>
            </div>

          

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#cbac70] hover:text-[#042e62]">
                Sign in
              </Link>
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-6 shadow-inner">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">First name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="First name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Last name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="Last name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input className="pl-10" placeholder="User name" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input className="pl-10" type="email" placeholder="email@example.com" {...field} />
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
                      <FormLabel className="text-gray-700">Password</FormLabel>
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Confirm Password</FormLabel>
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

                <Button
                  type="submit"
                  className={`w-full ${
                    accountType === "buyer" ? "bg-[#cbac70] hover:bg-black hover:cursor-pointer" : "bg-[#042e62] hover:bg-black hover:cursor-pointer"
                  }`}
                  disabled={isLoading}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Creating account..." : `Sign up as ${accountType}`}
                </Button>
              </form>
            </Form>

            <p className="mt-4 text-sm text-center text-gray-500">
              By registering, you agree to our{' '}
              <Link href="/terms" className="font-semibold text-[#cbac70] hover:text-[#042e62]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-semibold text-[#cbac70] hover:text-[#042e62]">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}