"use client";
import React, { useState } from "react";
// Added a new icon for the course selection
import { Lock, Save, Library } from "lucide-react";
import { updateUserPassword } from "./actions";
import Image from "next/image";

const ChangePasswordPage = () => {
  const [course, setCourse] = useState(""); // State for the selected course
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!course) {
      // New validation check
      setStatus("error");
      setMessage("PLEASE SELECT A COURSE");
      return;
    }

    if (!password || !confirmPassword) {
      setStatus("error");
      setMessage("BOTH PASSWORD FIELDS ARE REQUIRED");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("PASSWORDS DO NOT MATCH");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("PASSWORD MUST BE AT LEAST 6 CHARACTERS");
      return;
    }

    setStatus("loading");
    setMessage("UPDATING YOUR PASSWORD...");

    // You would likely pass the 'course' variable to your server action as well
    console.log("Submitting with Course:", course);

    const result = await updateUserPassword(password, course);
    if (result?.error) {
      setStatus("error");
      setMessage(result.error.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Image
        src={"/images/8bitBG9.png"}
        fill
        alt="BG"
        className="object-cover"
      />
      <div className="pixel-panel p-8 max-w-md w-full">
        <h1 className="pixel-font text-2xl text-white text-center mb-2">
          UPDATE YOUR PASSWORD
        </h1>
        <p className="pixel-font text-xs text-cyan-300 text-center mb-8">
          PLEASE SET A NEW PASSWORD TO CONTINUE
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* === NEW SELECT FIELD START === */}
          <div>
            <div className="pixel-font text-xs text-white mb-3 text-center">
              SELECT YOUR COURSE:
            </div>
            <div className="relative">
              <Library className="text-[#607d8b] w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="pixel-select input-with-icon" // Use new class
                disabled={status === "loading"}
                required
              >
                <option value="" disabled>
                  CHOOSE YOUR COURSE...
                </option>
                <option value="m3-genius-program">M3 Genius Program</option>
                <option value="vedic-math">Vedic math</option>
              </select>
            </div>
          </div>
          {/* === NEW SELECT FIELD END === */}

          <div>
            <div className="pixel-font text-xs text-white mb-3 text-center">
              NEW PASSWORD:
            </div>
            <div className="relative">
              <Lock className="text-[#607d8b] w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER NEW PASSWORD"
                className="pixel-input input-with-icon"
                disabled={status === "loading"}
              />
            </div>
          </div>

          <div>
            <div className="pixel-font text-xs text-white mb-3 text-center">
              CONFIRM PASSWORD:
            </div>
            <div className="relative">
              <Lock className="text-[#607d8b] w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="CONFIRM NEW PASSWORD"
                className="pixel-input input-with-icon"
                disabled={status === "loading"}
              />
            </div>
          </div>

          {message && (
            <div
              className={`status-message ${
                status === "error"
                  ? "error"
                  : status === "loading"
                  ? "warning"
                  : ""
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="pixel-button pixel-button-green w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {status === "loading" ? "SAVING..." : "SAVE AND CONTINUE"}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
