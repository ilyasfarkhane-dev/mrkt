"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
  
    if (!token) {
      toast.error("Verification failed", {
        description: "Verification token is missing.",
        className: "bg-red-500 text-white border-none",
      });
      router.push("/login");
      return;
    }
  
    const verifyEmail = async () => {
      try {
        const response = await apiClient.get(`/auth/verify-email?token=${token}`);
  
        // Success case
        toast.success("Email verified successfully!", {
          description: "You can now log in to your account.",
          className: "bg-green-500 text-white border-none",
          duration: 5000,
        });
        router.push("/login");
      } catch (error: any) {
        toast.error("Verification failed", {
          description: error.response?.data?.error || error.message || "An error occurred during verification.",
          className: "bg-red-500 text-white border-none",
        });
        router.push("/login");
      }
    };
  
    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Verifying your email...</p>
    </div>
  );
};

export default VerifyEmail;