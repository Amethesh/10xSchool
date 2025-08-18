/**
 * Utility functions for level access management
 */

export function formatLevelName(level: string): string {
  if (!level || typeof level !== 'string') {
    return '';
  }
  
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
}

// Standard level names and their hierarchy (kept for backward compatibility)
// This will be the fallback when database levels are not available
export const LEVEL_HIERARCHY = [
  'beginner',
  'movers',
  'flyers',
  'ket',
  'pet',
  'fce',
  'cae',
  'cpe',
] as const;

export type LevelName = typeof LEVEL_HIERARCHY[number] | string;

/**
 * Check if a level name is valid (uses fallback hierarchy)
 */
export function isValidLevel(level: string): level is LevelName {
  return LEVEL_HIERARCHY.includes(level.toLowerCase() as any);
}

/**
 * Get the level index in the hierarchy (0-based)
 */
export function getLevelIndex(level: string): number {
  return LEVEL_HIERARCHY.indexOf(level.toLowerCase() as any);
}

/**
 * Check if a level name is valid against a dynamic level list
 */
export function isValidLevelInList(level: string, levelList: string[]): boolean {
  return levelList.includes(level.toLowerCase());
}

/**
 * Get the level index in a dynamic hierarchy (0-based)
 */
export function getLevelIndexInList(level: string, levelList: string[]): number {
  return levelList.indexOf(level.toLowerCase());
}

/**
 * Check if level A is higher than level B in the hierarchy
 */
export function isLevelHigher(levelA: string, levelB: string): boolean {
  const indexA = getLevelIndex(levelA);
  const indexB = getLevelIndex(levelB);
  
  if (indexA === -1 || indexB === -1) {
    return false; // Invalid levels
  }
  
  return indexA > indexB;
}

/**
 * Get all levels up to and including the specified level
 */
export function getLevelsUpTo(level: string): string[] {
  const index = getLevelIndex(level);
  
  if (index === -1) {
    return ['beginner']; // Default to beginner for invalid levels
  }
  
  return LEVEL_HIERARCHY.slice(0, index + 1);
}

/**
 * Check if level A is higher than level B in a dynamic hierarchy
 */
export function isLevelHigherInList(levelA: string, levelB: string, levelList: string[]): boolean {
  const indexA = getLevelIndexInList(levelA, levelList);
  const indexB = getLevelIndexInList(levelB, levelList);
  
  if (indexA === -1 || indexB === -1) {
    return false; // Invalid levels
  }
  
  return indexA > indexB;
}

/**
 * Get all levels up to and including the specified level in a dynamic hierarchy
 */
export function getLevelsUpToInList(level: string, levelList: string[]): string[] {
  const index = getLevelIndexInList(level, levelList);
  
  if (index === -1) {
    return levelList.length > 0 ? [levelList[0]] : ['beginner']; // Default to first level
  }
  
  return levelList.slice(0, index + 1);
}

/**
 * Get the next level in the hierarchy
 */
export function getNextLevel(level: string): string | null {
  const index = getLevelIndex(level);
  
  if (index === -1 || index >= LEVEL_HIERARCHY.length - 1) {
    return null; // Invalid level or already at highest level
  }
  
  return LEVEL_HIERARCHY[index + 1];
}

/**
 * Get the previous level in the hierarchy
 */
export function getPreviousLevel(level: string): string | null {
  const index = getLevelIndex(level);
  
  if (index <= 0) {
    return null; // Invalid level or already at lowest level
  }
  
  return LEVEL_HIERARCHY[index - 1];
}

/**
 * Get the next level in a dynamic hierarchy
 */
export function getNextLevelInList(level: string, levelList: string[]): string | null {
  const index = getLevelIndexInList(level, levelList);
  
  if (index === -1 || index >= levelList.length - 1) {
    return null; // Invalid level or already at highest level
  }
  
  return levelList[index + 1];
}

/**
 * Get the previous level in a dynamic hierarchy
 */
export function getPreviousLevelInList(level: string, levelList: string[]): string | null {
  const index = getLevelIndexInList(level, levelList);
  
  if (index <= 0) {
    return null; // Invalid level or already at lowest level
  }
  
  return levelList[index - 1];
}

/**
 * Get level description
 */
export function getLevelDescription(level: string): string {
  const descriptions: Record<string, string> = {
    beginner: 'Basic level for new learners',
    movers: 'Elementary level with fundamental concepts',
    flyers: 'Pre-intermediate level with expanded vocabulary',
    ket: 'Key English Test - A2 level',
    pet: 'Preliminary English Test - B1 level',
    fce: 'First Certificate in English - B2 level',
    cae: 'Certificate in Advanced English - C1 level',
    cpe: 'Certificate of Proficiency in English - C2 level',
  };
  
  return descriptions[level.toLowerCase()] || 'Advanced level content';
}

/**
 * Get level color for UI display
 */
export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    beginner: 'green',
    movers: 'blue',
    flyers: 'purple',
    ket: 'orange',
    pet: 'yellow',
    fce: 'red',
    cae: 'pink',
    cpe: 'indigo',
  };
  
  return colors[level.toLowerCase()] || 'gray';
}

/**
 * Check if a level requires special access (not beginner)
 */
export function requiresSpecialAccess(level: string): boolean {
  return level.toLowerCase() !== 'beginner';
}

/**
 * Get recommended prerequisite levels
 */
export function getPrerequisiteLevels(level: string): string[] {
  const index = getLevelIndex(level);
  
  if (index <= 0) {
    return []; // No prerequisites for beginner or invalid levels
  }
  
  // Return all previous levels as prerequisites
  return LEVEL_HIERARCHY.slice(0, index);
}

/**
 * Get recommended prerequisite levels in a dynamic hierarchy
 */
export function getPrerequisiteLevelsInList(level: string, levelList: string[]): string[] {
  const index = getLevelIndexInList(level, levelList);
  
  if (index <= 0) {
    return []; // No prerequisites for first level or invalid levels
  }
  
  // Return all previous levels as prerequisites
  return levelList.slice(0, index);
}

/**
 * Validate level access request
 */
export function validateLevelAccessRequest(
  studentLevel: string,
  requestedLevel: string
): {
  isValid: boolean;
  reason?: string;
} {
  // Check if levels are valid
  if (!isValidLevel(studentLevel) || !isValidLevel(requestedLevel)) {
    return {
      isValid: false,
      reason: 'Invalid level specified',
    };
  }
  
  // Beginner level doesn't need access request
  if (requestedLevel.toLowerCase() === 'beginner') {
    return {
      isValid: false,
      reason: 'Beginner level is always accessible',
    };
  }
  
  // Check if student is requesting a level too far ahead
  const studentIndex = getLevelIndex(studentLevel);
  const requestedIndex = getLevelIndex(requestedLevel);
  
  // Allow requesting up to 2 levels ahead
  if (requestedIndex > studentIndex + 2) {
    return {
      isValid: false,
      reason: 'Cannot request access to levels more than 2 steps ahead',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate level access request with dynamic level list
 */
export function validateLevelAccessRequestInList(
  studentLevel: string,
  requestedLevel: string,
  levelList: string[]
): {
  isValid: boolean;
  reason?: string;
} {
  // Check if levels are valid
  if (!isValidLevelInList(studentLevel, levelList) || !isValidLevelInList(requestedLevel, levelList)) {
    return {
      isValid: false,
      reason: 'Invalid level specified',
    };
  }
  
  // First level doesn't need access request
  if (levelList.length > 0 && requestedLevel.toLowerCase() === levelList[0]) {
    return {
      isValid: false,
      reason: 'First level is always accessible',
    };
  }
  
  // Check if student is requesting a level too far ahead
  const studentIndex = getLevelIndexInList(studentLevel, levelList);
  const requestedIndex = getLevelIndexInList(requestedLevel, levelList);
  
  // Allow requesting up to 2 levels ahead
  if (requestedIndex > studentIndex + 2) {
    return {
      isValid: false,
      reason: 'Cannot request access to levels more than 2 steps ahead',
    };
  }
  
  return { isValid: true };
}

/**
 * Generate level access summary for a student
 */
export function generateLevelAccessSummary(
  accessibleLevels: string[],
  currentLevel?: string
): {
  totalLevels: number;
  accessibleCount: number;
  lockedCount: number;
  nextLevel: string | null;
  progressPercentage: number;
} {
  const totalLevels = LEVEL_HIERARCHY.length;
  const accessibleCount = accessibleLevels.length;
  const lockedCount = totalLevels - accessibleCount;
  
  // Find the highest accessible level
  const highestAccessibleIndex = Math.max(
    ...accessibleLevels.map(level => getLevelIndex(level))
  );
  
  const nextLevel = highestAccessibleIndex < totalLevels - 1 
    ? LEVEL_HIERARCHY[highestAccessibleIndex + 1]
    : null;
  
  const progressPercentage = Math.round((accessibleCount / totalLevels) * 100);
  
  return {
    totalLevels,
    accessibleCount,
    lockedCount,
    nextLevel,
    progressPercentage,
  };
}

/**
 * Generate level access summary for a student with dynamic level list
 */
export function generateLevelAccessSummaryInList(
  accessibleLevels: string[],
  levelList: string[],
  currentLevel?: string
): {
  totalLevels: number;
  accessibleCount: number;
  lockedCount: number;
  nextLevel: string | null;
  progressPercentage: number;
} {
  const totalLevels = levelList.length;
  const accessibleCount = accessibleLevels.length;
  const lockedCount = totalLevels - accessibleCount;
  
  // Find the highest accessible level
  const highestAccessibleIndex = Math.max(
    ...accessibleLevels.map(level => getLevelIndexInList(level, levelList))
  );
  
  const nextLevel = highestAccessibleIndex < totalLevels - 1 
    ? levelList[highestAccessibleIndex + 1]
    : null;
  
  const progressPercentage = Math.round((accessibleCount / totalLevels) * 100);
  
  return {
    totalLevels,
    accessibleCount,
    lockedCount,
    nextLevel,
    progressPercentage,
  };
}

/**
 * Sort levels by hierarchy
 */
export function sortLevelsByHierarchy(levels: string[]): string[] {
  return levels.sort((a, b) => {
    const indexA = getLevelIndex(a);
    const indexB = getLevelIndex(b);
    
    // Put invalid levels at the end
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
}

/**
 * Sort levels by a dynamic hierarchy
 */
export function sortLevelsByHierarchyInList(levels: string[], levelList: string[]): string[] {
  return levels.sort((a, b) => {
    const indexA = getLevelIndexInList(a, levelList);
    const indexB = getLevelIndexInList(b, levelList);
    
    // Put invalid levels at the end
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
}

/**
 * Get level statistics for admin dashboard
 */
export function getLevelStatistics(
  studentLevelData: Array<{ level: string; count: number }>
): {
  levelDistribution: Record<string, number>;
  totalStudents: number;
  averageLevel: number;
  mostPopularLevel: string;
} {
  const levelDistribution: Record<string, number> = {};
  let totalStudents = 0;
  let weightedSum = 0;
  let maxCount = 0;
  let mostPopularLevel = 'beginner';
  
  // Initialize all levels with 0
  LEVEL_HIERARCHY.forEach(level => {
    levelDistribution[level] = 0;
  });
  
  // Process student data
  studentLevelData.forEach(({ level, count }) => {
    if (isValidLevel(level)) {
      levelDistribution[level] = count;
      totalStudents += count;
      weightedSum += getLevelIndex(level) * count;
      
      if (count > maxCount) {
        maxCount = count;
        mostPopularLevel = level;
      }
    }
  });
  
  const averageLevel = totalStudents > 0 ? weightedSum / totalStudents : 0;
  
  return {
    levelDistribution,
    totalStudents,
    averageLevel,
    mostPopularLevel,
  };
}

/**
 * Get level statistics for admin dashboard with dynamic level list
 */
export function getLevelStatisticsInList(
  studentLevelData: Array<{ level: string; count: number }>,
  levelList: string[]
): {
  levelDistribution: Record<string, number>;
  totalStudents: number;
  averageLevel: number;
  mostPopularLevel: string;
} {
  const levelDistribution: Record<string, number> = {};
  let totalStudents = 0;
  let weightedSum = 0;
  let maxCount = 0;
  let mostPopularLevel = levelList[0] || 'beginner';
  
  // Initialize all levels with 0
  levelList.forEach(level => {
    levelDistribution[level] = 0;
  });
  
  // Process student data
  studentLevelData.forEach(({ level, count }) => {
    if (isValidLevelInList(level, levelList)) {
      levelDistribution[level] = count;
      totalStudents += count;
      weightedSum += getLevelIndexInList(level, levelList) * count;
      
      if (count > maxCount) {
        maxCount = count;
        mostPopularLevel = level;
      }
    }
  });
  
  const averageLevel = totalStudents > 0 ? weightedSum / totalStudents : 0;
  
  return {
    levelDistribution,
    totalStudents,
    averageLevel,
    mostPopularLevel,
  };
}