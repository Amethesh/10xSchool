// /app/admin/dashboard/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  Users,
  Search,
  Trash2,
  LineChart,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import {
  getAllStudentsData,
  getPendingRequestsCount,
  deleteStudentByAdmin,
} from "./actions";
import EditStudentModal from "@/components/admin/EditStudentModal";
import RankLadder, { rankIndex } from "@/components/admin/RankLadder";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { avatarTint, initials } from "@/components/admin/avatar";

// Define the Student type for type safety
export type Student = {
  id: string;
  full_name: string;
  student_id: string;
  email: string;
  total_score: number;
  level: number;
  level_no: number | null;
  rank: string;
  course: string | null;
  currentLevel?: {
    id: number;
    name: string;
    type: string;
    difficulty_level: number;
  } | null;
  teacher_id?: string | null;
  teacher_name?: string | null;
};

export type Level = {
  id: number;
  name: string;
  type: string;
  difficulty_level: number;
};

type SortKey = "full_name" | "level" | "total_score" | "rank";

const COURSE_LABELS: Record<string, string> = {
  "m3-genius-program": "M3 Genius",
  "vedic-math": "Vedic Math",
};

const AdminDashboardPage = () => {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<SortKey>("total_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryClient = useQueryClient();

  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-students-list"],
    queryFn: getAllStudentsData,
  });

  const { data: pendingRequestsCount } = useQuery({
    queryKey: ["admin-pending-requests-count"],
    queryFn: getPendingRequestsCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { mutate: deleteStudent, isPending: isDeleting } = useMutation({
    mutationFn: deleteStudentByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students-list"] });
      setDeletingStudentId(null);
    },
  });

  const visibleStudents = React.useMemo(() => {
    if (!students) return [];

    const term = searchTerm.trim().toLowerCase();

    const filtered = students.filter((student) => {
      const matchesSearch =
        !term ||
        (student.full_name?.toLowerCase() || "").includes(term) ||
        (student.student_id?.toLowerCase() || "").includes(term) ||
        (student.email?.toLowerCase() || "").includes(term);

      return matchesSearch && (!onlyUnassigned || !student.teacher_id);
    });

    return [...filtered].sort((a, b) => {
      const aValue = sortBy === "rank" ? rankIndex(a.rank) : a[sortBy];
      const bValue = sortBy === "rank" ? rankIndex(b.rank) : b[sortBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [students, searchTerm, onlyUnassigned, sortBy, sortOrder]);

  const stats = React.useMemo(() => {
    const list = students ?? [];
    const scores = list.map((s) => s.total_score || 0);

    return {
      total: list.length,
      m3: list.filter((s) => (s.course ?? "m3-genius-program") === "m3-genius-program")
        .length,
      vedic: list.filter((s) => s.course === "vedic-math").length,
      avgScore: scores.length
        ? Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length)
        : 0,
      lowScore: scores.length ? Math.min(...scores) : 0,
      highScore: scores.length ? Math.max(...scores) : 0,
      legends: list.filter((s) => rankIndex(s.rank) === 5).length,
      climbing: list.filter((s) => {
        const i = rankIndex(s.rank);
        return i >= 2 && i <= 4;
      }).length,
      starting: list.filter((s) => rankIndex(s.rank) <= 1).length,
      assigned: list.filter((s) => !!s.teacher_id).length,
      unassigned: list.filter((s) => !s.teacher_id).length,
      // Sorted score curve — a real distribution, not a fabricated time series
      curve: [...scores].sort((a, b) => a - b),
      topFive: [...list]
        .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
        .slice(0, 5),
    };
  }, [students]);

  const handleSort = (field: SortKey) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleQuickDelete = (studentId: string, studentName: string) => {
    if (
      window.confirm(
        `Delete ${studentName}? This removes their account and progress, and cannot be undone.`
      )
    ) {
      setDeletingStudentId(studentId);
      deleteStudent(studentId);
    }
  };

  const sortArrow = (field: SortKey) =>
    sortBy === field ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  if (isLoading) {
    return (
      <div className="ac-root flex items-center justify-center p-6">
        <div className="text-center">
          <p className="ac-display text-xl text-[#141414] mb-4">
            Getting things ready
          </p>
          <div className="flex gap-1.5 justify-center">
            {["#f0df6e", "#cfe0b4", "#b4c48d", "#a6bedb"].map((c, i) => (
              <span
                key={c}
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ background: c, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ac-root flex items-center justify-center p-6">
        <div className="ac-card p-8 max-w-md text-center">
          <p className="ac-display text-xl text-[#141414] mb-2">
            The roster didn&apos;t load
          </p>
          <p className="text-sm text-[#8c8578] mb-6">{error.message}</p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin-students-list"],
              })
            }
            className="ac-btn ac-btn-primary"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="ac-root">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-5">
          <AdminTopBar active="dashboard" />

          <div className="flex flex-col xl:flex-row gap-5 items-start">
            {/* ---- Main column ---- */}
            <main className="flex-1 min-w-0 w-full">
              {/* Search */}
              <div className="flex items-center gap-3 mb-7">
                <span className="w-11 h-11 rounded-full bg-[#cfe0b4] flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-[#141414]" />
                </span>
                <div className="flex-1 flex items-center gap-3 ac-card px-4 py-1.5 rounded-full">
                  <input
                    type="text"
                    placeholder="Search a student by name, ID, or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent outline-none text-sm py-2 placeholder:text-[#8c8578]"
                  />
                  <span className="hidden sm:inline text-xs text-[#8c8578] shrink-0">
                    Show:
                  </span>
                  <div className="hidden sm:flex gap-1.5 shrink-0">
                    <button
                      onClick={() => setOnlyUnassigned(false)}
                      className={`ac-chip${!onlyUnassigned ? " is-on" : ""}`}
                    >
                      Everyone
                    </button>
                    <button
                      onClick={() => setOnlyUnassigned(true)}
                      className={`ac-chip${onlyUnassigned ? " is-on" : ""}`}
                    >
                      No teacher
                    </button>
                  </div>
                </div>
              </div>

              {/* Greeting */}
              <h1 className="ac-display text-[32px] sm:text-[40px] leading-tight text-[#141414]">
                Good morning
              </h1>
              <p className="text-sm text-[#8c8578] mt-2 mb-6 max-w-xl">
                {stats.total === 0
                  ? "No students on the roster yet. Add your first one to get started."
                  : `${stats.total} ${
                      stats.total === 1 ? "student is" : "students are"
                    } learning with you today, averaging ${stats.avgScore.toLocaleString()} points.`}
                {pendingRequestsCount
                  ? ` ${pendingRequestsCount} ${
                      pendingRequestsCount === 1 ? "request" : "requests"
                    } waiting on you.`
                  : ""}
              </p>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                {/* Students */}
                <div className="ac-card ac-card-yellow p-5">
                  <svg
                    className="ac-card-art"
                    width="120"
                    height="120"
                    viewBox="0 0 60 60"
                    fill="#141414"
                  >
                    <rect x="12" y="0" width="24" height="12" />
                    <rect x="0" y="12" width="12" height="24" />
                    <rect x="12" y="12" width="24" height="24" />
                    <rect x="36" y="24" width="12" height="12" />
                    <rect x="24" y="36" width="24" height="12" />
                  </svg>
                  <p className="ac-card-title relative">Students:</p>
                  <div className="flex gap-6 mt-4 relative">
                    <div>
                      <div className="ac-stat ac-num">{stats.total}</div>
                      <div className="ac-caption mt-1">Total</div>
                    </div>
                    <div>
                      <div className="ac-stat ac-num">{stats.m3}</div>
                      <div className="ac-caption mt-1">M3 Genius</div>
                    </div>
                    <div>
                      <div className="ac-stat ac-num">{stats.vedic}</div>
                      <div className="ac-caption mt-1">Vedic</div>
                    </div>
                  </div>
                  <ScoreBars scores={stats.curve} />
                </div>

                {/* Scores */}
                <div className="ac-card ac-card-pink p-5">
                  <svg
                    className="ac-card-art"
                    width="120"
                    height="120"
                    viewBox="0 0 60 60"
                    fill="#141414"
                  >
                    <rect x="24" y="0" width="12" height="12" />
                    <rect x="12" y="12" width="36" height="12" />
                    <rect x="0" y="24" width="60" height="12" />
                    <rect x="12" y="36" width="36" height="12" />
                    <rect x="24" y="48" width="12" height="12" />
                  </svg>
                  <p className="ac-card-title relative">Score summary:</p>
                  <div className="flex gap-6 mt-4 relative">
                    <div>
                      <div className="ac-stat ac-num">
                        {stats.avgScore.toLocaleString()}
                      </div>
                      <div className="ac-caption mt-1">Average</div>
                    </div>
                    <div>
                      <div className="ac-stat ac-num">
                        {stats.lowScore.toLocaleString()}
                      </div>
                      <div className="ac-caption mt-1">Lowest</div>
                    </div>
                    <div>
                      <div className="ac-stat ac-num">
                        {stats.highScore.toLocaleString()}
                      </div>
                      <div className="ac-caption mt-1">Highest</div>
                    </div>
                  </div>
                  <ScoreCurve scores={stats.curve} />
                </div>

                {/* Ranks */}
                <div className="ac-card ac-card-green p-5">
                  <svg
                    className="ac-card-art"
                    width="110"
                    height="110"
                    viewBox="0 0 60 60"
                    fill="#141414"
                  >
                    <rect x="0" y="12" width="60" height="12" />
                    <rect x="12" y="24" width="36" height="12" />
                    <rect x="24" y="36" width="12" height="12" />
                  </svg>
                  <p className="ac-card-title relative">By rank:</p>
                  <div className="flex gap-6 mt-4 relative">
                    <div>
                      <div className="ac-stat ac-num">{stats.legends}</div>
                      <div className="ac-caption mt-1">Legend</div>
                    </div>
                    <div>
                      <div className="ac-stat ac-num">{stats.climbing}</div>
                      <div className="ac-caption mt-1">Climbing</div>
                    </div>
                    <div>
                      <div className="ac-stat ac-num">{stats.starting}</div>
                      <div className="ac-caption mt-1">Starting out</div>
                    </div>
                  </div>
                </div>

                {/* Coverage */}
                <div className="ac-card ac-card-blue p-5">
                  <svg
                    className="ac-card-art"
                    width="110"
                    height="110"
                    viewBox="0 0 60 60"
                    fill="#141414"
                  >
                    <rect x="24" y="0" width="12" height="60" />
                    <rect x="0" y="24" width="60" height="12" />
                    <rect x="12" y="12" width="12" height="12" />
                    <rect x="36" y="12" width="12" height="12" />
                    <rect x="12" y="36" width="12" height="12" />
                    <rect x="36" y="36" width="12" height="12" />
                  </svg>
                  <p className="ac-card-title relative">Coverage:</p>
                  <div className="flex gap-6 mt-4 relative">
                    <div>
                      <div className="ac-stat ac-num">{stats.assigned}</div>
                      <div className="ac-caption mt-1">Has teacher</div>
                    </div>
                    <div>
                      <div className="ac-stat ac-num">{stats.unassigned}</div>
                      <div className="ac-caption mt-1">No teacher</div>
                    </div>
                    <div>
                      <div className="ac-stat ac-num">
                        {pendingRequestsCount ?? 0}
                      </div>
                      <div className="ac-caption mt-1">Waiting</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roster */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="ac-display text-xl text-[#141414]">
                  Student list
                </h2>
                <span className="text-xs text-[#8c8578] ml-auto">
                  {visibleStudents.length === students?.length
                    ? `${visibleStudents.length} shown`
                    : `${visibleStudents.length} of ${students?.length ?? 0}`}
                </span>
              </div>

              <div className="ac-card overflow-hidden">
                <div className="overflow-x-auto ac-scroll">
                  <table className="ac-table">
                    <thead>
                      <tr>
                        <th
                          className="ac-sortable"
                          onClick={() => handleSort("full_name")}
                        >
                          Student{sortArrow("full_name")}
                        </th>
                        <th>Course</th>
                        <th
                          className="ac-sortable"
                          onClick={() => handleSort("level")}
                        >
                          Level{sortArrow("level")}
                        </th>
                        <th
                          className="ac-sortable ac-right"
                          onClick={() => handleSort("total_score")}
                        >
                          Score{sortArrow("total_score")}
                        </th>
                        <th
                          className="ac-sortable"
                          onClick={() => handleSort("rank")}
                        >
                          Rank{sortArrow("rank")}
                        </th>
                        <th className="ac-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span
                                className="ac-avatar"
                                style={{
                                  background: avatarTint(student.id),
                                }}
                              >
                                {initials(student.full_name)}
                              </span>
                              <span>
                                <span className="block text-[#141414] font-medium leading-tight">
                                  {student.full_name}
                                </span>
                                <span className="block text-xs text-[#8c8578] mt-0.5">
                                  <span className="ac-num">
                                    {student.student_id}
                                  </span>
                                  {student.teacher_name ? (
                                    <> · {student.teacher_name}</>
                                  ) : (
                                    <span className="text-[#b3261e]">
                                      {" "}
                                      · no teacher
                                    </span>
                                  )}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="text-[#8c8578] whitespace-nowrap">
                            {COURSE_LABELS[student.course || ""] || "—"}
                          </td>
                          <td className="whitespace-nowrap">
                            {student.currentLevel ? (
                              student.currentLevel.name
                            ) : (
                              <span className="text-[#8c8578]">Not set</span>
                            )}
                          </td>
                          <td className="ac-right">
                            <span className="ac-pill">
                              {(student.total_score || 0).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <RankLadder rank={student.rank} />
                          </td>
                          <td>
                            <div className="ac-row-actions">
                              <a
                                href={`/student/dashboard?studentId=${student.id}`}
                                className="ac-icon-btn"
                                title={`View ${student.full_name}'s progress`}
                              >
                                <LineChart className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => setEditingStudent(student)}
                                className="ac-icon-btn"
                                title={`Edit ${student.full_name}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleQuickDelete(
                                    student.id,
                                    student.full_name
                                  )
                                }
                                disabled={
                                  isDeleting && deletingStudentId === student.id
                                }
                                className="ac-icon-btn ac-icon-btn-danger"
                                title={`Delete ${student.full_name}`}
                              >
                                {isDeleting &&
                                deletingStudentId === student.id ? (
                                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {visibleStudents.length === 0 && (
                    <div className="text-center py-16 px-6">
                      <Users className="w-9 h-9 text-[#d8d0c1] mx-auto mb-4" />
                      {students && students.length > 0 ? (
                        <>
                          <p className="text-sm text-[#8c8578] mb-5">
                            No students match these filters.
                          </p>
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setOnlyUnassigned(false);
                            }}
                            className="ac-btn"
                          >
                            Clear filters
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-[#8c8578] mb-5">
                            No students yet. Add the first one to get started.
                          </p>
                          <a
                            href="/admin/create-student"
                            className="ac-btn ac-btn-primary"
                          >
                            New student
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* ---- Right rail ---- */}
            <aside className="w-full xl:w-[310px] shrink-0 flex flex-col gap-4 xl:sticky xl:top-5">
              <div className="ac-card p-5">
                <h2 className="ac-display text-lg text-[#141414] mb-4">
                  Needs you
                </h2>

                <a
                  href="/admin/access-requests"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#e9f2dd] hover:bg-[#cfe0b4] transition-colors group mb-2"
                >
                  <span className="ac-stat ac-num w-8 text-center">
                    {pendingRequestsCount ?? 0}
                  </span>
                  <span className="text-[13px] leading-snug text-[#2c2a26] mr-auto">
                    waiting for level access
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#141414] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <button
                  onClick={() => setOnlyUnassigned(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#f7f2e6] hover:bg-[#f0e8d5] transition-colors text-left"
                >
                  <span className="ac-stat ac-num w-8 text-center">
                    {stats.unassigned}
                  </span>
                  <span className="text-[13px] leading-snug text-[#2c2a26] mr-auto">
                    without a teacher
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8c8578] shrink-0" />
                </button>
              </div>

              <div className="ac-card p-5">
                <h2 className="ac-display text-lg text-[#141414] mb-1">
                  Top of the ladder
                </h2>
                <p className="text-xs text-[#8c8578] mb-4">
                  Highest scores on the roster
                </p>

                {stats.topFive.length === 0 ? (
                  <p className="text-[13px] text-[#8c8578]">
                    Scores appear here once students start playing.
                  </p>
                ) : (
                  <ol className="flex flex-col gap-1">
                    {stats.topFive.map((student, i) => (
                      <li key={student.id}>
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#e9f2dd] transition-colors text-left"
                        >
                          <span className="ac-num text-xs text-[#8c8578] w-4 shrink-0">
                            {i + 1}
                          </span>
                          <span
                            className="ac-avatar !w-8 !h-8 !text-[11px]"
                            style={{ background: avatarTint(student.id) }}
                          >
                            {initials(student.full_name)}
                          </span>
                          <span className="min-w-0 mr-auto">
                            <span className="block text-[13px] text-[#141414] truncate">
                              {student.full_name}
                            </span>
                            <span className="block text-[11px] text-[#8c8578]">
                              {student.rank
                                ? student.rank.charAt(0) +
                                  student.rank.slice(1).toLowerCase()
                                : "Unranked"}
                            </span>
                          </span>
                          <span className="ac-num text-[13px] text-[#141414] shrink-0">
                            {(student.total_score || 0).toLocaleString()}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </>
  );
};

/** Score spread across the roster, bucketed. Real data, no invented series. */
const ScoreBars = ({ scores }: { scores: number[] }) => {
  if (scores.length === 0) return <div className="h-14 mt-4" />;

  const buckets = 14;
  const max = Math.max(...scores, 1);
  const counts = new Array(buckets).fill(0);
  scores.forEach((s) => {
    const i = Math.min(buckets - 1, Math.floor((s / max) * buckets));
    counts[i] += 1;
  });
  const peak = Math.max(...counts, 1);

  return (
    <div className="relative h-14 mt-4 flex items-end gap-1">
      {counts.map((c, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-[#141414]"
          style={{ height: `${Math.max(6, (c / peak) * 100)}%`, opacity: 0.75 }}
        />
      ))}
    </div>
  );
};

/** Every score on the roster, sorted low to high — the shape of the class. */
const ScoreCurve = ({ scores }: { scores: number[] }) => {
  if (scores.length < 2) return <div className="h-14 mt-4" />;

  const max = Math.max(...scores, 1);
  const points = scores
    .map((s, i) => {
      const x = (i / (scores.length - 1)) * 100;
      const y = 100 - (s / max) * 90 - 5;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="relative h-14 mt-4">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <polyline
          points={points}
          fill="none"
          stroke="#141414"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default AdminDashboardPage;
