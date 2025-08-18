// src/components/results/PerformanceMetrics.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Target, Clock, TrendingUp } from 'lucide-react';
import { formatTime } from '@/utils/ResultUtils';

type MetricColor = 'green' | 'cyan' | 'purple';

const colorClasses: Record<MetricColor, {
  panelBorder: string;
  panelBg: string;
  iconWrapBg: string;
  text: string;
}> = {
  green: {
    panelBorder: 'border-green-400/50',
    panelBg: 'bg-green-500/10',
    iconWrapBg: 'bg-green-400/20',
    text: 'text-green-300',
  },
  cyan: {
    panelBorder: 'border-cyan-400/50',
    panelBg: 'bg-cyan-500/10',
    iconWrapBg: 'bg-cyan-400/20',
    text: 'text-cyan-300',
  },
  purple: {
    panelBorder: 'border-purple-400/50',
    panelBg: 'bg-purple-500/10',
    iconWrapBg: 'bg-purple-400/20',
    text: 'text-purple-300',
  },
};

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: MetricColor;
  index?: number;
}

const MetricCard = ({ icon, value, label, color, index = 0 }: MetricCardProps) => {
  const c = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.05 * index }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`pixel-panel !p-1.5 sm:!p-3 text-center ${c.panelBg} ${c.panelBorder}`}
    >
      <div className={`p-1 sm:p-2 rounded-lg ${c.iconWrapBg} ${c.text} w-fit mx-auto mb-1 sm:mb-2`}>
        {icon}
      </div>
      <div className={`pixel-font ${c.text} text-sm sm:text-xl leading-none mb-0.5`}>{value}</div>
      <div className="text-[7px] text-nowrap sm:text-[11px] pixel-font text-white/80 tracking-widest">
        {label}
      </div>
    </motion.div>
  );
};

interface PerformanceMetricsProps {
  accuracy: number;
  timeSpent: number;
  avgTimePerQuestion: number;
}

export const PerformanceMetrics = ({
  accuracy,
  timeSpent,
  avgTimePerQuestion,
}: PerformanceMetricsProps) => {
  return (
    <motion.div
      className="grid grid-cols-3 gap-1.5 sm:gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
    >
      <MetricCard
        index={0}
        icon={<Target className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
        value={`${accuracy}%`}
        label="ACCURACY"
        color="green"
      />
      <MetricCard
        index={1}
        icon={<Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
        value={formatTime(timeSpent)}
        label="TIME"
        color="cyan"
      />
      <MetricCard
        index={2}
        icon={<TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
        value={`${avgTimePerQuestion}s`}
        label="AVG SPEED"
        color="purple"
      />
    </motion.div>
  );
};
