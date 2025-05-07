// components/ui/toast-provider.tsx
"use client";

import * as React from "react";
import { Toaster } from "sonner"; // Import Toaster from Sonner

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "!fixed", // Ensure fixed positioning
          },
        }}
      />
    </>
  );
}