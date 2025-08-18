"use client"
import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentLevelsData } from "./actions";
import { logout } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HorizontalLevelSelector } from "@/components/levels/LevelSelector";
import WeekGrid from "@/components/levels/WeekGrid";
import { ProcessedWeekLesson } from "@/types/types";
import LevelStatistics from "@/components/levels/LevelStatistics";
import LevelProfile from "@/components/levels/LevelProfile";
import LevelHeader from "@/components/levels/LevelHeader";
import LevelSkeleton from "@/components/levels/LevelSkeleton";

const StudentLevelsPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedLevelName, setSelectedLevelName] = useState<string>("beginner");

  const { data, isLoading, error } = useQuery({
    queryKey: ["studentLevels"],
    queryFn: () => getStudentLevelsData(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data?.levels && !selectedLevelName) {
      const firstApprovedLevel = data.levels.find(l => l.approved);
      if (firstApprovedLevel) {
        console.log("LEVEL INITIAL", firstApprovedLevel.name)
        setSelectedLevelName(firstApprovedLevel.name);
      } else if (data.levels.length > 0) {
        setSelectedLevelName(data.levels[0].name);
      }
    }
  }, [data, selectedLevelName]);


  const requestAccessMutation = useMutation({
    mutationFn: async (levelName: string) => {
      const response = await fetch("/api/student/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: levelName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request access");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentLevels"] });
    },
  });

  const currentLevel = useMemo(() => {
    if (!data?.levels || !selectedLevelName) return null;
    return data.levels.find((l) => l.name === selectedLevelName);
  }, [data?.levels, selectedLevelName]);

  const processedWeeks: ProcessedWeekLesson[] = useMemo(() => {
    if (!currentLevel?.weeks) return [];

    const sortedWeeks = [...currentLevel.weeks].sort((a, b) => a.week_no - b.week_no);

    return sortedWeeks.map((week) => {
      const completed = !!week.attempt && week.attempt.score > 0;
      const bestScore = week.attempt?.score ?? 0;
      const stars = bestScore >= 90 ? 3 : bestScore >= 70 ? 2 : bestScore >= 50 ? 1 : 0;
      const hasAccess = currentLevel.approved;

      return { ...week, hasAccess, completed, bestScore, stars };
    });
  }, [currentLevel]);

  const handleLessonClick = (levelId: number, levelName: string, weekNo: number, hasAccess: boolean) => {
    if (!hasAccess) return;
    console.log(`PUSHED: /student/quiz/${levelId}/${weekNo}?levelName=${levelName}`)
    router.push(
      `/student/quiz/${levelId}/${weekNo}?levelName=${encodeURIComponent(
        levelName
      )}`
    );
  };

  const handleRequestAccess = (levelName: string) => {
    requestAccessMutation.mutate(levelName);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo relative overflow-hidden">
        <Image src={"/images/8bitBG2.png"} fill alt="BG" className="object-cover" />
        <LevelSkeleton /> 
      </main>
    );
  }

  if (error) {
    return <div className="pixel-font bg-black text-red-500 text-center p-20">ERROR: {error.message}</div>;
  }

  if (!data || !currentLevel) {
    return <div className="pixel-font text-white text-center p-20">NO LEVEL DATA FOUND...</div>;
  }

  const { profile, levels } = data;

  // Calculate overall progress
  const totalWeeks = levels.reduce((sum, level) => sum + (level.approved ? level.weeks.length : 0), 0);
  const completedWeeks = levels.reduce((sum, level) =>
    sum + level.weeks.filter(week => week.attempt && week.attempt.score > 0).length, 0
  );
  const overallProgress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo relative overflow-hidden">
      <Image
        src={"/images/8bitBG2.png"}
        fill
        alt="BG"
        className="object-cover"
      />
      
      <div className="relative z-10 min-h-screen p-3 sm:p-6 max-w-7xl mx-auto">
        {/* Enhanced Profile Header */}
        <LevelProfile 
          profile={profile} 
          overallProgress={overallProgress}
          logout={logout}
        />

        {/* Main Content Panel */}
        <div className="pixel-panel p-4 sm:p-6 backdrop-blur-sm bg-black/20">
          <div className="text-center mb-8">
             {/* ... main content header is unchanged ... */}
             <h2 className="pixel-font text-xl sm:text-3xl text-white mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              MATH QUEST LEVELS
            </h2>
            <div className="pixel-font text-xs sm:text-sm text-cyan-300 mb-4">
              CHOOSE YOUR ADVENTURE AND CONQUER THE CHALLENGES
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto rounded-full"></div>
          </div>

          <HorizontalLevelSelector 
            levels={levels}
            selectedLevelName={selectedLevelName}
            setSelectedLevelName={setSelectedLevelName}
          />

          {/* Selected Level Content */}
          <div className="space-y-6">

            {/* Level Header (Unchanged) */}
            {currentLevel && (
                <LevelHeader 
                  currentLevel={currentLevel}
                  onReqAccess={handleRequestAccess}
                  isPending={requestAccessMutation.isPending}
                />
            )}

            {/* --- REPLACED a block of JSX with the new component --- */}
            <WeekGrid
              weeks={processedWeeks}
              onLessonClick={handleLessonClick}
              levelId={currentLevel.id}
              levelName={currentLevel.name}
            />
            {/* -------------------------------------------------------- */}

            {/* Enhanced Level Statistics */}
            <LevelStatistics weeks={processedWeeks} />

          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentLevelsPage;