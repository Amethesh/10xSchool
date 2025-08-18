import { createClient } from '../supabase/server';

/**
 * Create a server-side Supabase client for middleware and API routes
 */


/**
 * Server-side function to check if a student has access to a specific level
 */
export async function checkStudentLevelAccessServer(
  studentId: string,
  level: string
): Promise<boolean> {
const supabase = await createClient();

  // Beginner level is always accessible
  if (level.toLowerCase() === 'beginner') {
    return true;
  }

  
  const { data, error } = await supabase
    .from('level_access')
    .select('id')
    .eq('student_id', studentId)
    .eq('level', level)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Failed to check level access:', error.message);
    return false; // Fail closed for security
  }

  return !!data;
}

/**
 * Server-side function to get all levels a student has access to
 */
export async function getStudentAccessibleLevelsServer(
  studentId: string
): Promise<string[]> {
const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('level_access')
    .select('level')
    .eq('student_id', studentId);

  if (error) {
    console.error('Failed to fetch accessible levels:', error.message);
    return ['beginner']; // Return only beginner on error
  }

  // Always include beginner level
  const accessibleLevels = ['beginner'];
  
  if (data) {
    data.forEach(access => {
      if (access.level && !accessibleLevels.includes(access.level.toLowerCase())) {
        accessibleLevels.push(access.level.toLowerCase());
      }
    });
  }

  return accessibleLevels;
}

/**
 * Server-side function to validate level access for middleware
 */
export async function validateLevelAccessForRoute(
  userId: string,
  level: string
): Promise<{
  hasAccess: boolean;
  error?: string;
}> {
  try {
    const hasAccess = await checkStudentLevelAccessServer(userId, level);
    return { hasAccess };
  } catch (error) {
    console.error('Error validating level access:', error);
    return {
      hasAccess: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract level from quiz route path
 */
export function extractLevelFromPath(pathname: string): string | null {
  // Match patterns like /student/quiz/[level]/[week] or /student/levels/[level]
  const quizMatch = pathname.match(/\/student\/quiz\/([^\/]+)/);
  const levelMatch = pathname.match(/\/student\/levels\/([^\/]+)/);
  
  if (quizMatch) {
    return decodeURIComponent(quizMatch[1]);
  }
  
  if (levelMatch) {
    return decodeURIComponent(levelMatch[1]);
  }
  
  return null;
}

/**
 * Check if a route requires level access validation
 */
export function requiresLevelAccessValidation(pathname: string): boolean {
  // Routes that require level access validation
  const protectedRoutes = [
    /^\/student\/quiz\/[^\/]+/, // /student/quiz/[level]/...
    /^\/student\/levels\/[^\/]+/, // /student/levels/[level]
  ];
  
  return protectedRoutes.some(pattern => pattern.test(pathname));
}

/**
 * Server-side function to check if user has admin role
 */
export async function checkAdminRole(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to check admin role:', error.message);
    return false;
  }

  return data?.role === 'admin';
}