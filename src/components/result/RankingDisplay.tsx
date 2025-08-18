// src/components/results/RankingDisplay.tsx
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

interface RankingData {
    rank: number;
    totalStudents: number;
}

interface RankingDisplayProps {
    ranking: RankingData | null;
    isLoading: boolean;
}

export const RankingDisplay = ({ ranking, isLoading }: RankingDisplayProps) => {
    if (isLoading) return <p>Loading</p>;
    if (!ranking) return null;

    return (
        <motion.div
            className="pixel-panel !p-3 sm:!p-4 !border-yellow-400/50 !bg-yellow-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex items-center justify-center mb-2 sm:mb-3 gap-1 sm:gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                <h3 className="pixel-font text-xs sm:text-sm text-yellow-300 tracking-wider">YOUR RANKING</h3>
            </div>
            <div className="text-center">
                <div className="text-xl sm:text-4xl pixel-font text-white mb-1">#{ranking.rank}</div>
                <div className="pixel-font text-[8px] sm:text-xs text-cyan-300">
                    OUT OF {ranking.totalStudents} STUDENTS
                </div>
            </div>
        </motion.div>
    );
};