// src/components/results/ActionButtons.tsx
import { motion } from 'motion/react';
import { RotateCcw, Home } from 'lucide-react';

interface ActionButtonsProps {
    onRetry: () => void;
    onBackToLevels: () => void;
}

export const ActionButtons = ({ onRetry, onBackToLevels }: ActionButtonsProps) => (
    <motion.div
        className="flex flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-cyan-400/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        <button onClick={onRetry} className="pixel-button pixel-button-green flex-1 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base py-2 sm:py-3">
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>TRY AGAIN</span>
        </button>
        <button onClick={onBackToLevels} className="pixel-button-secondary flex-1 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base py-2 sm:py-3">
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>BACK TO LEVELS</span>
        </button>
    </motion.div>
);