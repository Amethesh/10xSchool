// /app/admin/dashboard/EditStudentModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, User, Hash, Trophy, Star, Crown } from "lucide-react";
import { Student } from "@/app/admin/dashboard/page";
import { updateStudentByAdmin } from "@/app/admin/dashboard/actions";

type EditStudentModalProps = {
  student: Student;
  onClose: () => void;
};

const EditStudentModal = ({ student, onClose }: EditStudentModalProps) => {
  const [formData, setFormData] = useState<
    Omit<Student, "student_id" | "email">
  >({
    id: "",
    fullName: "",
    totalScore: 0,
    level: 0,
    rank: "",
  });

  const queryClient = useQueryClient();

  // Populate form when the student prop changes
  useEffect(() => {
    setFormData({
      id: student.id,
      fullName: student.fullName,
      totalScore: student.totalScore,
      level: student.level,
      rank: student.rank,
    });
  }, [student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const {
    mutate: updateStudent,
    isPending,
    error,
  } = useMutation({
    mutationFn: updateStudentByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students-list"] });
      onClose(); // Close modal on success
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("id", formData.id);
    data.append("fullName", formData.fullName);
    data.append("totalScore", String(formData.totalScore));
    data.append("level", String(formData.level));
    data.append("rank", formData.rank);
    updateStudent(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="pixel-panel p-6 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-500"
        >
          <X />
        </button>

        <h3 className="pixel-font text-lg text-white mb-6 text-center">
          EDIT STUDENT
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="input-container">
            <User className="input-icon w-4 h-4" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="pixel-input input-with-icon"
              required
            />
          </div>
          {/* Level */}
          <div className="input-container">
            <Trophy className="input-icon w-4 h-4" />
            <input
              type="number"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="pixel-input input-with-icon"
              required
            />
          </div>
          {/* Score */}
          <div className="input-container">
            <Star className="input-icon w-4 h-4" />
            <input
              type="number"
              name="totalScore"
              value={formData.totalScore}
              onChange={handleInputChange}
              className="pixel-input input-with-icon"
              required
            />
          </div>
          {/* Rank */}
          <div className="input-container">
            <Crown className="input-icon w-4 h-4" />
            <input
              type="text"
              name="rank"
              value={formData.rank}
              onChange={handleInputChange}
              className="pixel-input input-with-icon"
              required
            />
          </div>

          {error && (
            <p className="pixel-font text-xs text-red-400 text-center">
              {error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="pixel-button pixel-button-green w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {isPending ? "SAVING..." : "SAVE CHANGES"}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
