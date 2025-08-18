// /app/admin/dashboard/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Edit,
  ShieldCheck,
  Users,
  Trophy,
  Target,
  TrendingUp,
  Search,
  Plus,
  BadgeCheck
} from "lucide-react";
import { getAllStudentsData } from "./actions";
import EditStudentModal from "@/components/admin/EditStudentModal";
import { logout } from "@/app/(auth)/actions";
import Image from "next/image";

// Define the Student type for type safety
export type Student = {
  id: string;
  full_name: string;
  student_id: string;
  email: string;
  total_score: number;
  level: number;
  rank: string;
};

const AdminDashboardPage = () => {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // UPDATED: Sort keys now match the Student type
  const [sortBy, setSortBy] = useState<keyof Omit<Student, 'grantedLevels'>>("total_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-students-list"],
    queryFn: getAllStudentsData,
  });

  // Filter and sort students
  const filteredAndSortedStudents = React.useMemo(() => {
    if (!students) return [];

    let filtered = students.filter(student =>
      // UPDATED: Use student.full_name
      (student.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.student_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Default to number comparison
      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [students, searchTerm, sortBy, sortOrder]);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!students || students.length === 0) return { total: 0, avgScore: 0, maxLevel: 0, topRank: "N/A" };

    return {
      total: students.length,
      // UPDATED: Use s.total_score
      avgScore: Math.round(students.reduce((sum, s) => sum + (s.total_score || 0), 0) / students.length),
      maxLevel: Math.max(...students.map(s => s.level || 0)),
      topRank: students.find(s => s.rank === "LEGEND")?.rank || students[0]?.rank || "N/A"
    };
  }, [students]);

  const handleSort = (field: keyof Omit<Student, 'grantedLevels'>) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Image
          src={"/images/8bitBG6.png"}
          fill
          alt="BG"
          className="object-fill"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="pixel-panel p-8 text-center">
          <div className="pixel-font text-white text-lg mb-4">
            LOADING ADMIN DASHBOARD...
          </div>
          <div className="w-16 h-16 mx-auto border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="pixel-panel p-8 text-center border-red-500">
          <div className="pixel-font text-red-400 text-lg mb-4">
            SYSTEM ERROR
          </div>
          <div className="pixel-font text-red-300 text-xs">
            {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 sm:p-6">
        <Image
          src={"/images/8bitBG6.png"}
          fill
          alt="BG"
          className="object-fill"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="pixel-stars absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="pixel-panel backdrop-blur-lg p-6 mb-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShieldCheck className="w-12 h-12 text-cyan-400 floating-icon" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="pixel-font text-xl sm:text-2xl lg:text-3xl text-white mb-1 tracking-wider">
                    ADMIN DASHBOARD
                  </h1>
                  <p className="pixel-font text-xs text-cyan-300">
                    STUDENT MANAGEMENT SYSTEM v1.0
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/admin/create-student"
                  className="pixel-button pixel-button-green flex items-center gap-2 justify-center"
                >
                  <Plus className="w-4 h-4" />
                  CREATE STUDENT
                </a>
                <a
                  href="/admin/access-requests"
                  className="pixel-button pixel-button-purple pixel-button-green flex items-center gap-2 justify-center"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Manage Requests
                </a>
                <form action={logout}>
                  <button className="pixel-button pixel-button-secondary  w-full sm:w-auto">
                    LOG OUT
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="pixel-panel backdrop-blur-lg p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="pixel-font text-xs text-gray-300">TOTAL</div>
                  <div className="pixel-font text-lg text-white">{stats.total}</div>
                </div>
              </div>
            </div>

            <div className="pixel-panel backdrop-blur-lg p-4 bg-gradient-to-br from-green-900/30 to-green-800/30">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <div className="pixel-font text-xs text-gray-300">AVG SCORE</div>
                  <div className="pixel-font text-lg text-white">{stats.avgScore}</div>
                </div>
              </div>
            </div>

            <div className="pixel-panel backdrop-blur-lg p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="pixel-font text-xs text-gray-300">MAX LVL</div>
                  <div className="pixel-font text-lg text-white">{stats.maxLevel}</div>
                </div>
              </div>
            </div>

            <div className="pixel-panel backdrop-blur-lg p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="pixel-font text-xs text-gray-300">TOP RANK</div>
                  <div className="pixel-font text-xs text-white">{stats.topRank}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="pixel-panel backdrop-blur-lg p-4 mb-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  placeholder="SEARCH STUDENTS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pixel-input input-with-icon"
                />
              </div>

              <div className="flex gap-2">
                {/* UPDATED: Select values now use snake_case */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as keyof Student)}
                  className="pixel-select"
                >
                  <option value="total_score">SCORE</option>
                  <option value="level">LEVEL</option>
                  <option value="full_name">NAME</option>
                  <option value="rank">RANK</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="pixel-button px-3"
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

        {/* Students Table */}
        <div className="pixel-panel backdrop-blur-lg p-6 bg-gradient-to-br from-gray-900/40 to-black/40">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full pixel-font text-xs text-white">
              <thead>
                <tr className="border-b-2 border-cyan-400">
                  {/* UPDATED: onClick and sortBy checks use snake_case */}
                  <th
                    className="p-4 text-left cursor-pointer hover:text-cyan-300 transition-colors"
                    onClick={() => handleSort("full_name")}
                  >
                    FULL NAME {sortBy === "full_name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-4 text-left">STUDENT ID</th>
                  <th
                    className="p-4 text-left cursor-pointer hover:text-cyan-300 transition-colors"
                    onClick={() => handleSort("level")}
                  >
                    LEVEL {sortBy === "level" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-4 text-left cursor-pointer hover:text-cyan-300 transition-colors"
                    onClick={() => handleSort("total_score")}
                  >
                    SCORE {sortBy === "total_score" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-4 text-left cursor-pointer hover:text-cyan-300 transition-colors"
                    onClick={() => handleSort("rank")}
                  >
                    RANK {sortBy === "rank" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`border-b border-gray-700/50 hover:bg-gradient-to-r hover:from-cyan-900/20 hover:to-blue-900/20 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-transparent'}`}
                  >
                    {/* UPDATED: Use student.full_name */}
                    <td className="p-4 font-medium">{student.full_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded border border-yellow-600/50">
                        {student.student_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded border border-purple-600/50">
                        LVL {student.level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded border border-green-600/50">
                        {/* UPDATED: Use student.total_score */}
                        {(student.total_score || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded border ${student.rank === "LEGEND"
                          ? "bg-yellow-900/30 text-yellow-300 border-yellow-600/50"
                          : student.rank === "MASTER"
                            ? "bg-purple-900/30 text-purple-300 border-purple-600/50"
                            : "bg-cyan-900/30 text-cyan-300 border-cyan-600/50"
                        }`}>
                        {student.rank}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="pixel-button text-xs p-2 hover:scale-105 transition-transform"
                        title="Edit Student"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

              {filteredAndSortedStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="pixel-font text-gray-500 text-sm">
                    {searchTerm ? "NO STUDENTS MATCH YOUR SEARCH" : "NO STUDENTS FOUND"}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="pixel-button pixel-button-blue mt-4 text-xs"
                    >
                      CLEAR SEARCH
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Results summary */}
            {filteredAndSortedStudents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="pixel-font text-xs text-gray-400 text-center">
                  SHOWING {filteredAndSortedStudents.length} OF {students?.length || 0} STUDENTS
                </p>
              </div>
            )}
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

export default AdminDashboardPage;
