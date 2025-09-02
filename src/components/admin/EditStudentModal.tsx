// /app/admin/dashboard/EditStudentModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  X,
  Save,
  User,
  Trophy,
  Star,
  Crown,
  Trash2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { Student, Level } from "@/app/admin/dashboard/page";
import {
  updateStudentByAdmin,
  deleteStudentByAdmin,
  getAllLevels,
} from "@/app/admin/dashboard/actions";

type EditStudentModalProps = {
  student: Student;
  onClose: () => void;
};

const EditStudentModal = ({ student, onClose }: EditStudentModalProps) => {
  const [formData, setFormData] = useState<
    Omit<Student, "student_id" | "email">
  >({
    id: "",
    full_name: "",
    total_score: 0,
    level: 0,
    level_no: null,
    rank: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all available levels
  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: ["admin-levels"],
    queryFn: getAllLevels,
  });

  // Populate form when the student prop changes
  useEffect(() => {
    setFormData({
      id: student.id,
      full_name: student.full_name,
      total_score: student.total_score,
      level: student.level,
      level_no: student.level_no,
      rank: student.rank,
    });
  }, [student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const {
    mutate: updateStudent,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: updateStudentByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students-list"] });
      onClose();
    },
  });

  const {
    mutate: deleteStudent,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteStudentByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students-list"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("id", formData.id);
    data.append("full_name", formData.full_name);
    data.append("total_score", String(formData.total_score));
    if (formData.level_no !== null) {
      data.append("level_no", String(formData.level_no));
    }
    data.append("rank", formData.rank);
    updateStudent(data);
  };

  const handleDelete = () => {
    deleteStudent(formData.id);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "level_no") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="pixel-panel p-6 max-w-md w-full relative border-red-500">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="pixel-font text-lg text-white mb-4">
              DELETE STUDENT
            </h3>
            <p className="pixel-font text-sm text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="text-red-400">{formData.full_name}</span>?
              <br />
              <span className="text-red-300 text-xs">
                This action cannot be undone.
              </span>
            </p>

            {deleteError && (
              <p className="pixel-font text-xs text-red-400 mb-4">
                {deleteError.message}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="pixel-button pixel-button-secondary flex-1"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="pixel-button pixel-button-red flex-1"
              >
                {isDeleting ? "DELETING..." : "DELETE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="pixel-panel p-6 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="pixel-font text-lg text-white mb-6 text-center">
          EDIT STUDENT
        </h3>

        {levelsLoading && (
          <div className="pixel-font text-xs text-cyan-400 text-center mb-4">
            LOADING LEVELS...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="input-container">
            <User className="input-icon w-4 h-4" />
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="pixel-input input-with-icon"
              required
            />
          </div>

          {/* Level Selection */}
          <div className="input-container">
            <BookOpen className="input-icon w-4 h-4" />
            <select
              name="level_no"
              value={formData.level_no || ""}
              onChange={handleSelectChange}
              className="pixel-select w-full"
              disabled={levelsLoading}
            >
              <option value="">Select Level</option>
              {levels?.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name} (Difficulty: {level.difficulty_level})
                </option>
              ))}
            </select>
          </div>

          {/* Current Level Display */}
          {student.currentLevel && (
            <div className="pixel-panel p-3 bg-blue-900/20 border-blue-500/50">
              <div className="pixel-font text-xs text-blue-300 mb-1">
                CURRENT LEVEL
              </div>
              <div className="pixel-font text-sm text-white">
                {student.currentLevel.name} - {student.currentLevel.type}
              </div>
              <div className="pixel-font text-xs text-gray-400">
                Difficulty: {student.currentLevel.difficulty_level}
              </div>
            </div>
          )}

          {/* Score */}
          <div className="input-container">
            <Star className="input-icon w-4 h-4" />
            <input
              type="number"
              name="total_score"
              placeholder="Total Score"
              value={formData.total_score}
              onChange={handleInputChange}
              className="pixel-input input-with-icon"
              min="0"
              required
            />
          </div>

          {/* Rank */}
          <div className="input-container">
            <Crown className="input-icon w-4 h-4" />
            <select
              name="rank"
              value={formData.rank}
              onChange={handleSelectChange}
              className="pixel-select w-full"
              required
            >
              <option value="">Select Rank</option>
              <option value="NOVICE">NOVICE</option>
              <option value="APPRENTICE">APPRENTICE</option>
              <option value="ADEPT">ADEPT</option>
              <option value="EXPERT">EXPERT</option>
              <option value="MASTER">MASTER</option>
              <option value="LEGEND">LEGEND</option>
            </select>
          </div>

          {(updateError || deleteError) && (
            <p className="pixel-font text-xs text-red-400 text-center">
              {updateError?.message || deleteError?.message}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating || isDeleting}
              className="pixel-button pixel-button-red flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              DELETE
            </button>

            <button
              type="submit"
              disabled={isUpdating || isDeleting}
              className="pixel-button pixel-button-green flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
