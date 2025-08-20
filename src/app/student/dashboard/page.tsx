"use client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getStudentLevelsData } from "../levels/actions";
import LevelProfile from "@/components/levels/LevelProfile";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export default function Page() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentLevels"],
    queryFn: () => getStudentLevelsData(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Image
          src={"/images/8bitBG2.png"}
          fill
          alt="BG"
          className="object-cover"
        />
        <div className="pixel-panel p-6 text-center">
          <div className="pixel-font text-white mb-4">Loading Dashboard...</div>
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  if (error) return <div>Error loading data</div>;
  if (!data || !data.profile || !data.levels)
    return <div>No data available</div>;

  const { profile, levels } = data;
  const totalWeeks = levels.reduce(
    (sum, level) => sum + (level.approved ? level.weeks.length : 0),
    0
  );
  const completedWeeks = levels.reduce(
    (sum, level) =>
      sum +
      level.weeks.filter((week) => week.attempt && week.attempt.score > 0)
        .length,
    0
  );
  const overallProgress =
    totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Image
        src={"/images/8bitBG2.png"}
        fill
        alt="BG"
        className="object-cover"
      />
      <div className="relative z-10 p-3 sm:p-6 max-w-7xl mx-auto">
        <LevelProfile
          profile={profile}
          overallProgress={overallProgress}
          page="dashboard"
        />
        <div className="bg-">
          <StudentDashboard studentId={profile.id}/>
        </div>
      </div>
    </main>
  );
}
