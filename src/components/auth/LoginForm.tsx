"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/(auth)/login/actions";
import Image from "next/image";
import Link from "next/link";

// Your main component
const PixelLoginForm = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "error" | "loading">(
    "idle"
  );

  const [isPending, startTransition] = useTransition();

  // Hook to read URL search parameters for errors
  const searchParams = useSearchParams();

  // Effect to show error message from URL (if login fails and redirects)
  useEffect(() => {
    const errorMessage = searchParams.get("error");
    if (errorMessage) {
      setStatusMessage(errorMessage.toUpperCase());
      setStatusType("error");
    }
  }, [searchParams]);

  // The main form submission handler
  const handleSubmit = (formData: FormData) => {
    // Clear any previous messages
    setStatusMessage("CONNECTING TO SERVER...");
    setStatusType("loading");
    startTransition(async () => {
      const result = await loginAction(
        formData.get("studentId") as string,
        formData.get("password") as string
      );

      // If the server action returns an error object, display it
      if (result?.error) {
        setStatusMessage(result.error);
        setStatusType("error");
      }
      // On success, the Server Action handles the redirect, so no client-side redirect is needed.
    });
  };

  return (
    <>
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="pixel-stars absolute"
          style={{
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* Use a <form> element and pass the server action to its `action` prop */}
        <form
          action={handleSubmit}
          className="pixel-panel p-8 w-full max-w-md mx-auto"
        >
          {/* 10x School Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/10x_small.png"
                  alt="10x Academy Logo"
                  width={40}
                  height={40}
                />
                <p className="text-lg font-bold text-white ml-3 pixel-font tracking-wider">
                  THE 10X SCHOOL
                </p>
              </div>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="pixel-font text-2xl sm:text-3xl text-white mb-4 tracking-wider">
              SYSTEM LOGIN
            </h1>
            <div className="pixel-font text-xs text-cyan-300 blink">
              ENTER CREDENTIALS TO ACCESS
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="pixel-font text-xs text-white mb-3 text-center">
                STUDENT ID:
              </div>
              <div className="input-container relative">
                <User className="text-[#607d8b] w-4 h-4 absolute top-3 left-2" />
                <input
                  type="text"
                  name="studentId"
                  placeholder="ENTER STUDENT ID"
                  className="pixel-input input-with-icon"
                  maxLength={20}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <div className="pixel-font text-xs text-white mb-3 text-center">
                PASSWORD:
              </div>
              <div className="input-container relative">
                <Lock className="text-[#607d8b] w-4 h-4 absolute top-3 left-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password" // Use name attribute
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER PASSWORD"
                  className="pixel-input input-with-icon"
                  style={{ paddingRight: "50px" }}
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white w-4 h-4 absolute top-3 right-4"
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {statusMessage && (
              <div className={`status-message ${statusType}`}>
                {isPending && (
                  <span>
                    {statusMessage}
                    <span className="loading-dots">.</span>
                    <span className="loading-dots">.</span>
                    <span className="loading-dots">.</span>
                  </span>
                )}
                {!isPending && statusMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="pixel-button pixel-button-green w-full"
              style={{ padding: "14px 20px" }}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                {isPending ? "CONNECTING..." : "ACCESS SYSTEM"}
              </div>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PixelLoginForm;
