"use client";
import React, { useState } from "react";
// 1. Import Copy and Check icons
import { User, Mail, Lock, UserPlus, Copy, Check } from "lucide-react";
import { createStudentAction } from "./actions"; 

const CreateStudentPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // 2. Add state for the new student ID and copy feedback
  const [newStudentId, setNewStudentId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Add a function to handle copying the ID to the clipboard
  const handleCopy = () => {
    if (!newStudentId) return;
    navigator.clipboard.writeText(newStudentId).then(() => {
      setIsCopied(true);
      // Reset the "Copied!" feedback after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNewStudentId(null); // Reset previous ID on new submission

    if (
      !formData.fullName.trim() ||
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
    setStatusMessage("CREATING STUDENT ACCOUNT...");

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("password", formData.password);

    try {
      const result = await createStudentAction(data);

      if (result.error) {
        setStatus("error");
        setStatusMessage(result.error.toUpperCase());
      } else if (result.success && result.student_id) {
        setStatus("success");
        setStatusMessage(
          `STUDENT "${formData.fullName.toUpperCase()}" CREATED SUCCESSFULLY!`
        );
        // 4. Store the new student ID in state
        setNewStudentId(result.student_id);

        setTimeout(() => {
          setFormData({ fullName: "", email: "", password: "" });
          setStatus("idle");
          setStatusMessage("");
          setNewStudentId(null); // Clear the ID when resetting the form
        }, 5000); // Increased timeout to allow time to copy
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
        {/* ... (background and overlay divs remain the same) ... */}
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
            {/* ... (header and form inputs remain the same) ... */}
            <div className="text-center mb-6 sm:mb-8 flex-shrink-0">
              <h1 className="pixel-font text-2xl sm:text-3xl text-white mb-2 sm:mb-4 tracking-wider">
                CREATE STUDENT
              </h1>
              <div className="pixel-font text-xs text-cyan-300 blink">
                ADMIN ACCESS REQUIRED
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 flex-grow">
              {/* Inputs for fullName, email, password */}
              <div>
                <div className="pixel-font text-xs text-white mb-2 sm:mb-3 text-center">
                  FULL NAME:
                </div>
                <div className="input-container relative">
                  <User className="text-[#607d8b] w-4 h-4 absolute top-3 left-2" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
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

              {/* Status Message */}
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
              {status === "success" && newStudentId && (
                <div className="pixel-panel-inset text-center p-3">
                  <div className="pixel-font text-xs text-white mb-2">
                    NEW STUDENT ID:
                  </div>
                  <div className="flex items-center justify-center gap-4 bg-black p-2">
                    <span className="pixel-font text-yellow-300 tracking-widest text-sm">
                      {newStudentId}
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

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="pixel-button pixel-button-green w-full text-center"
                style={{ padding: "14px 20px" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  {status === "loading"
                    ? "CREATING STUDENT..."
                    : "CREATE STUDENT"}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateStudentPage;
