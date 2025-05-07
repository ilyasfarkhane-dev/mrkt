'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import apiClient from "@/lib/apiClient";
import {Input} from "@/components/ui/input";
import Label from "@/components/form/Label";
import {Button} from "@/components/ui/button";
import {  EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function SignInForm() {
  const [user_name, setUser_name] = useState("");
  const [password, setPassword] = useState("");
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/'); 
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.post("/auth/login", {
        user_name,
        password
      });
      
      if (!response.data.token) {
        throw new Error("Authentication failed: No token received");
      }

      const { token, user } = response.data;
      login(token, user);
      toast.success('Login successful! Redirecting...');
      router.push('/');
    } catch (error: unknown) {
      console.error("Login failed:", error)
    
      let errorMessage = 'Login failed. Please try again.'
    
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number
            data?: {
              message?: string
            }
          }
        }
    
        if (axiosError.response?.status === 401) {
          errorMessage = 'Invalid username or password'
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
    
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#fff',
          color: '#ef4444',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      })
    }
    
  };


  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
       <Toaster 
        toastOptions={{
          success: {
            style: {
              background: '#f0fdf4',
              color: '#16a34a',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              borderRadius: '8px',
              fontWeight: '500',
            },
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your Username and password to sign in!
            </p>
          </div>
          <div>
           
            
            <form onSubmit={handleLogin} action="#" method="POST">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="user_name">
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input  id="user_name"
                    name="user_name"
                    type="text"
                    value={user_name}
                    onChange={(e) => setUser_name(e.target.value)}
                    required />
                </div>
                <div>
  <Label htmlFor="password">
    Password <span className="text-error-500">*</span>
  </Label>
  <div className="relative">
    <Input
      id="password"
      name="password"
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="pr-10" // Add padding to prevent text under the icon
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:focus:ring-brand-400"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeCloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
      ) : (
        <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
      )}
    </button>
  </div>
</div>
                <div className="flex items-center justify-between">
                 
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button   type="submit" className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>

           
          </div>
        </div>
      </div>
    </div>
  );
}
