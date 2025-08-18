"use client";

import { formatLevelName, getColorForDifficulty, getDifficultyLabel, getIconForDifficulty } from "@/utils/levelUtils";
import { Clock } from "lucide-react";

type levelType = {
    id: number;
    name: string;
    type: string;
    difficulty_level: number;
    approved: boolean;
    pending: boolean;
}

interface LevelHeaderProps {
    currentLevel: levelType
    onReqAccess: (levelName: string) => void;
    isPending: boolean;
}

const LevelHeader: React.FC<LevelHeaderProps> = ({ currentLevel, onReqAccess, isPending }) => {
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-gradient-to-r from-black/40 to-black/20 border border-cyan-400/30">
    <div className="flex items-center gap-4">
     <div className={`p-3 rounded-lg border-2 ${getColorForDifficulty(currentLevel.difficulty_level)} shadow-lg`}>
       {getIconForDifficulty(currentLevel.difficulty_level)}
     </div>
     <div>
       <h3 className="pixel-font text-lg sm:text-xl text-white mb-1">
         {formatLevelName(currentLevel.name)}
       </h3>
       <div className="flex items-center gap-3">
         <span className={`pixel-font text-[8px] px-2 py-1 rounded ${currentLevel.approved
             ? "text-green-400 bg-green-400/20"
             : currentLevel.pending
               ? "text-yellow-400 bg-yellow-400/20"
               : "text-red-400 bg-red-400/20"
           }`}>
           {currentLevel.approved ? "ACCESSIBLE" : currentLevel.pending ? "ACCESS PENDING" : "LOCKED"}
         </span>
         <span className="pixel-font text-[8px] text-cyan-300">
           {getDifficultyLabel(currentLevel.difficulty_level)} LEVEL
         </span>
       </div>
     </div>
   </div>
  
	{ !currentLevel.approved && <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
     {!currentLevel.approved && !currentLevel.pending && (
       <button
         onClick={() => onReqAccess(currentLevel.name)}
         disabled={isPending}
         className="pixel-button text-[8px] whitespace-nowrap"
       >
         {isPending ? "REQUESTING..." : "REQUEST ACCESS"}
       </button>
     )}
     {currentLevel.pending && (
       <button disabled className="pixel-button w-full opacity-70 text-xs flex gap-2 justify-center items-center">
         <Clock size={20} />
         REQUEST PENDING
       </button>
     )}
   </div>}

 </div>
  );
};

export default LevelHeader;