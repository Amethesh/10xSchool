"use client";
import React, { useState } from "react";
import { User, Mail, Lock, UserPlus, Copy, Check, ChevronLeft } from "lucide-react";
import { createTeacherAction } from "./actions";

const CreateTeacherPage = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [newTeacherId, setNewTeacherId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopy = () => {
    if (!newTeacherId) return;
    navigator.clipboard.writeText(newTeacherId).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNewTeacherId(null);

    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setStatus("error");
      setStatusMessage("ALL FIELDS ARE REQUIRED");
      return;
    }

    if (!formData.email.includes("@")) {
      setStatus("error");
      setStatusMessage("INVALID EMAIL FORMAT");
      return;
    }

    setStatus("loading");
    setStatusMessage("CREATING TEACHER ACCOUNT...");

    const data = new FormData();
    data.append("full_name", formData.full_name);
    data.append("email", formData.email);
    data.append("password", formData.password);

    try {
      const result = await createTeacherAction(data);

      if (result.error) {
        setStatus("error");
        setStatusMessage(result.error.toUpperCase());
      } else if (result.success && result.teacher_id) {
        setStatus("success");
        setStatusMessage(
          `TEACHER "${formData.full_name.toUpperCase()}" CREATED SUCCESSFULLY!`
        );
        setNewTeacherId(result.teacher_id);

        setTimeout(() => {
          setFormData({ full_name: "", email: "", password: "" });
          setStatus("idle");
          setStatusMessage("");
          setNewTeacherId(null);
        }, 5000);
      }
    } catch (err) {
      console.error("An unexpected error occurred:", err);
      setStatus("error");
      setStatusMessage("AN UNEXPECTED ERROR OCCURRED. PLEASE TRY AGAIN.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-black relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/8bitBG6.png')" }}
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div
            className="pixel-panel p-6 sm:p-8 w-full max-w-lg mx-auto overflow-y-auto custom-scrollbar"
            style={{ maxHeight: "calc(100vh - 32px)" }}
          >
            <div className="text-center mb-6 sm:mb-8 flex-shrink-0">
              <h1 className="pixel-font text-2xl sm:text-3xl text-white mb-2 sm:mb-4 tracking-wider">
                CREATE TEACHER
              </h1>
              <div className="pixel-font text-xs text-cyan-300 blink">
                ADMIN ACCESS REQUIRED
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 flex-grow">
              <div>
                <div className="pixel-font text-xs text-white mb-2 sm:mb-3 text-center">
                  FULL NAME:
                </div>
                <div className="input-container relative">
                  <User className="text-[#607d8b] w-4 h-4 absolute top-3 left-2" />
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="ENTER FULL NAME"
                    className="pixel-input input-with-icon"
                    maxLength={50}
                    disabled={status === "loading"}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="pixel-font text-xs text-white mb-2 sm:mb-3 text-center">
                  EMAIL ADDRESS:
                </div>
                <div className="input-container relative">
                  <Mail className="text-[#607d8b] w-4 h-4.5 absolute top-3 left-2" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ENTER EMAIL"
                    className="pixel-input input-with-icon"
                    maxLength={100}
                    disabled={status === "loading"}
                    required
                    style={{ textTransform: "none" }}
                  />
                </div>
              </div>
              <div>
                <div className="pixel-font text-xs text-white mb-2 sm:mb-3 text-center">
                  INITIAL PASSWORD:
                </div>
                <div className="input-container relative">
                  <Lock className="text-[#607d8b] w-4 h-4 absolute top-3 left-2" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="SET PASSWORD"
                    className="pixel-input input-with-icon"
                    maxLength={50}
                    disabled={status === "loading"}
                    required
                  />
                </div>
              </div>

              {statusMessage && (
                <div className={`status-message ${status}`}>
                  {status === "loading" ? (
                    <span>
                      {statusMessage}
                      <span className="loading-dots">.</span>
                      <span className="loading-dots">.</span>
                      <span className="loading-dots">.</span>
                    </span>
                  ) : (
                    statusMessage
                  )}
                </div>
              )}
              {status === "success" && newTeacherId && (
                <div className="pixel-panel-inset text-center p-3">
                  <div className="pixel-font text-xs text-white mb-2">
                    NEW TEACHER ID:
                  </div>
                  <div className="flex items-center justify-center gap-4 bg-black p-2">
                    <span className="pixel-font text-yellow-300 tracking-widest text-sm">
                      {newTeacherId}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-white hover:text-cyan-300 transition-colors"
                      title="Copy ID"
                    >
                      {isCopied ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className='flex gap-4 w-full'>
                <button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="pixel-button pixel-button-green text-center w-full"
                  style={{ padding: "14px 20px" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    {status === "loading"
                      ? "CREATING TEACHER..."
                      : "CREATE TEACHER"}
                  </div>
                </button>
                <a
                  href="/admin/dashboard"
                  className="pixel-button pixel-button-secondary flex items-center w-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                  Go BACK
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTeacherPage;
