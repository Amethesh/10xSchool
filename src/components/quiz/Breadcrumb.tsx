// src/components/ui/Breadcrumb.tsx (or a similar path)

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronRight, Home, PlayIcon, Trophy } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import clsx from 'clsx';
import { formatLevelName } from '@/lib/quiz/level-access-utils';

// --- Type Definitions ---
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

type CurrentPage = 'levels' | 'quiz' | 'results';

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};


// --- The Component ---
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <motion.nav
      className={clsx(
        "pixel-panel !p-3 sm:!p-4 !mb-0 ",
        className
      )}
      aria-label="Breadcrumb"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ol className="flex items-center space-x-1 sm:space-x-2">
        {items.map((item, index) => (
          <motion.li key={index} className="flex items-center" variants={itemVariants}>
            {/* The linkable or static breadcrumb item */}
            <div
              onClick={item.href && !item.isCurrent ? () => handleNavigation(item.href!) : undefined}
              className={clsx(
                "flex items-center pixel-font text-xs tracking-wider transition-colors",
                {
                  // Current Page Style
                  "text-cyan-300 font-bold": item.isCurrent,
                  // Linkable Page Style
                  "text-cyan-300/70 hover:text-cyan-300 cursor-pointer": item.href && !item.isCurrent,
                   // Non-linkable Page Style
                  "text-cyan-300/50": !item.href && !item.isCurrent,
                }
              )}
            >
              {item.icon && (
                <span className="mr-0 sm:mr-2 flex-shrink-0">{item.icon}</span>
              )}
              {/* On mobile, only show the label for the CURRENT page */}
              <span className={clsx({ 'hidden sm:inline': !item.isCurrent })}>
                {item.label}
              </span>
            </div>

            {/* Separator */}
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4 text-cyan-400/40 ml-1 sm:ml-2 flex-shrink-0" />
            )}
          </motion.li>
        ))}
      </ol>
    </motion.nav>
  );
}

export function generateQuizBreadcrumbs(
  levelName: string,
  weekNo?: number,
  currentPage: CurrentPage = 'levels'
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      label: 'Home',
      href: '/student/levels', // Always links back to the main level list
      icon: <Home className="w-4 h-4" />,
    },
  ];

  if (levelName) {
    // The level itself. It's only a link if we are on a deeper page.
    items.push({
      label: formatLevelName(levelName),
      // A common pattern: link back to the level page from quiz/results
      href: currentPage !== 'levels' ? `/student/levels` : undefined,
      icon: <BookOpen className="w-4 h-4" />,
      isCurrent: currentPage === 'levels',
    });

    if (weekNo) {
      // The quiz/week page.
      items.push({
        label: `Week ${weekNo}`,
        href: currentPage === 'results' ? `/student/quiz/${levelName}/${weekNo}` : undefined,
        icon: <PlayIcon className="w-4 h-4" />,
        isCurrent: currentPage === 'quiz',
      });

      // The results page is always the last item when present.
      if (currentPage === 'results') {
        items.push({
          label: 'Results',
          icon: <Trophy className="w-4 h-4" />,
          isCurrent: true,
        });
      }
    }
  }

  return items;
}