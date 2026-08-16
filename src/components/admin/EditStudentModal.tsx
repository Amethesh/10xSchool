// /app/admin/dashboard/EditStudentModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Save, Trash2, AlertTriangle, KeyRound } from "lucide-react";
import { Student } from "@/app/admin/dashboard/page";
import {
  updateStudentByAdmin,
  deleteStudentByAdmin,
  getAllLevels,
  getAllTeachers,
  resetStudentPasswordByAdmin,
} from "@/app/admin/dashboard/actions";

type EditStudentModalProps = {
  student: Student;
  onClose: () => void;
};

/**
 * Two tabs, deliberately: everything used in a routine edit lives on Profile,
 * and the two irreversible account actions live together on Account. Putting
 * "delete" next to "save" invites the wrong click.
 */
type Tab = "profile" | "account";

const EditStudentModal = ({ student, onClose }: EditStudentModalProps) => {
  const [tab, setTab] = useState<Tab>("profile");
  const [formData, setFormData] = useState<
    Omit<Student, "student_id" | "email">
  >({
    id: "",
    full_name: "",
    total_score: 0,
    level: 0,
    level_no: null,
    rank: "",
    course: null,
    teacher_id: null,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetValidationError, setResetValidationError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const queryClient = useQueryClient();

  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: ["admin-levels"],
    queryFn: getAllLevels,
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: getAllTeachers,
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
      course: student.course || "m3-genius-program",
      teacher_id: student.teacher_id || null,
    });
  }, [student]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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

  const {
    mutate: resetPassword,
    isPending: isResetting,
    error: resetError,
  } = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetStudentPasswordByAdmin(id, password),
    onSuccess: (result) => {
      setResetSuccess(result.message);
      setNewPassword("");
      setConfirmPassword("");
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
    data.append("course", formData.course || "m3-genius-program");
    if (formData.teacher_id) {
      data.append("teacher_id", formData.teacher_id);
    }
    updateStudent(data);
  };

  const handleDelete = () => {
    deleteStudent(formData.id);
  };

  const handleResetPassword = () => {
    setResetValidationError("");
    setResetSuccess("");

    if (!newPassword || !confirmPassword) {
      setResetValidationError("Enter the new password in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetValidationError("The two passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setResetValidationError("Use at least 6 characters.");
      return;
    }

    resetPassword({ id: formData.id, password: newPassword });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "level_no") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : null,
      }));
    } else if (name === "course") {
      // Switching course resets the level — student starts fresh on the new course
      setFormData((prev) => ({ ...prev, course: value, level_no: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const courseChanged = formData.course !== student.course;

  if (showDeleteConfirm) {
    return (
      <div className="ac-root ac-overlay fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="ac-card p-7 max-w-md w-full">
          <AlertTriangle className="w-9 h-9 text-[#b3261e] mb-4" />
          <h3 className="ac-display text-xl text-[#141414] mb-3">Delete student</h3>
          <p className="text-sm text-[#2c2a26] mb-2">
            This removes{" "}
            <span className="text-[#141414] font-medium">
              {formData.full_name}
            </span>
            &apos;s account, level access, and quiz history.
          </p>
          <p className="text-sm text-[#b3261e] mb-6">This can&apos;t be undone.</p>

          {deleteError && (
            <p className="text-sm text-[#b3261e] mb-4">{deleteError.message}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="ac-btn flex-1"
            >
              Keep student
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="ac-btn ac-btn-danger flex-1"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="ac-root ac-overlay fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="ac-card w-full max-w-lg max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${student.full_name}`}
      >
        {/* Identity is the header, so it never needs a form field */}
        <div className="px-6 pt-6 pb-0 shrink-0">
          <div className="flex items-start gap-4">
            <div className="mr-auto min-w-0">
              <h3 className="ac-display text-xl text-[#141414] truncate">
                {student.full_name}
              </h3>
              <p className="ac-num text-xs text-[#8c8578] mt-1">
                {student.student_id}
                {student.email ? ` · ${student.email}` : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ac-icon-btn shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className="flex gap-6 mt-5 border-b border-[#e7e0d3]"
            role="tablist"
          >
            <button
              role="tab"
              aria-selected={tab === "profile"}
              onClick={() => setTab("profile")}
              className="ac-tab"
            >
              Profile
            </button>
            <button
              role="tab"
              aria-selected={tab === "account"}
              onClick={() => setTab("account")}
              className="ac-tab"
            >
              Account
            </button>
          </div>
        </div>

        <div className="overflow-y-auto ac-scroll px-6 py-6 flex-1">
          {tab === "profile" ? (
            <form id="edit-student-form" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="ac-label" htmlFor="full_name">
                    Full name
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="ac-field ac-field-box"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ac-label" htmlFor="course">
                      Course
                    </label>
                    <select
                      id="course"
                      name="course"
                      value={formData.course || "m3-genius-program"}
                      onChange={handleSelectChange}
                      className="ac-field ac-field-box"
                    >
                      <option value="m3-genius-program">M3 Genius</option>
                      <option value="vedic-math">Vedic Math</option>
                    </select>
                  </div>

                  <div>
                    <label className="ac-label" htmlFor="level_no">
                      Level
                    </label>
                    <select
                      id="level_no"
                      name="level_no"
                      value={formData.level_no || ""}
                      onChange={handleSelectChange}
                      className="ac-field ac-field-box"
                      disabled={levelsLoading}
                    >
                      <option value="">
                        {levelsLoading ? "Loading…" : "Not set"}
                      </option>
                      {levels?.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name} · difficulty {level.difficulty_level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {courseChanged && (
                  <p className="text-sm text-[#6b5a1e] bg-[#fbf3d4] border border-[#efe0a5] rounded-xl px-4 py-3">
                    Changing the course resets this student&apos;s level. They
                    start fresh on the new course.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ac-label" htmlFor="total_score">
                      Total score
                    </label>
                    <input
                      id="total_score"
                      type="number"
                      name="total_score"
                      value={formData.total_score}
                      onChange={handleInputChange}
                      className="ac-field ac-field-box ac-num"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="ac-label" htmlFor="rank">
                      Rank
                    </label>
                    <select
                      id="rank"
                      name="rank"
                      value={formData.rank}
                      onChange={handleSelectChange}
                      className="ac-field ac-field-box"
                      required
                    >
                      <option value="">Not set</option>
                      <option value="NOVICE">Novice</option>
                      <option value="APPRENTICE">Apprentice</option>
                      <option value="ADEPT">Adept</option>
                      <option value="EXPERT">Expert</option>
                      <option value="MASTER">Master</option>
                      <option value="LEGEND">Legend</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="ac-label" htmlFor="teacher_id">
                    Teacher
                  </label>
                  <select
                    id="teacher_id"
                    name="teacher_id"
                    value={formData.teacher_id || ""}
                    onChange={handleSelectChange}
                    className="ac-field ac-field-box"
                    disabled={teachersLoading}
                  >
                    <option value="">No teacher assigned</option>
                    {teachers?.map((teacher: any) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name} ({teacher.teacher_id})
                      </option>
                    ))}
                  </select>
                </div>

                {updateError && (
                  <p className="text-sm text-[#b3261e]">
                    {updateError.message}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <section>
                <h4 className="ac-display text-base text-[#141414] mb-2">
                  Reset password
                </h4>
                <p className="text-sm text-[#8c8578] mb-4">
                  Sets a temporary password to give the student. They choose
                  their own the next time they log in.
                </p>

                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="ac-field ac-field-box"
                    autoComplete="new-password"
                    disabled={isResetting}
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="ac-field ac-field-box"
                    autoComplete="new-password"
                    disabled={isResetting}
                  />

                  {(resetValidationError || resetError) && (
                    <p className="text-sm text-[#b3261e]">
                      {resetValidationError || resetError?.message}
                    </p>
                  )}

                  {resetSuccess && (
                    <p className="text-sm text-[#4a7c3f]">{resetSuccess}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isResetting || isUpdating}
                    className="ac-btn w-full"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {isResetting ? "Resetting…" : "Reset password"}
                  </button>
                </div>
              </section>

              <section className="pt-6 border-t border-[#e7e0d3]">
                <h4 className="ac-display text-base text-[#b3261e] mb-2">
                  Delete student
                </h4>
                <p className="text-sm text-[#8c8578] mb-4">
                  Removes the account, level access, and quiz history for good.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isUpdating || isDeleting}
                  className="ac-btn ac-btn-danger w-full"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete student
                </button>
              </section>
            </div>
          )}
        </div>

        {/* Save belongs to Profile only, so it can't be confused with account actions */}
        {tab === "profile" && (
          <div className="px-6 py-4 border-t border-[#e7e0d3] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="ac-btn">
              Cancel
            </button>
            <button
              type="submit"
              form="edit-student-form"
              disabled={isUpdating || isDeleting}
              className="ac-btn ac-btn-primary"
            >
              <Save className="w-3.5 h-3.5" />
              {isUpdating ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditStudentModal;
