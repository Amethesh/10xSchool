import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { LevelAccess, AccessRequest } from '@/types/types';

type Tables = Database['public']['Tables'];
type LevelAccessRow = Tables['level_access']['Row'];
type AccessRequestRow = Tables['access_requests']['Row'];
type LevelAccessInsert = Tables['level_access']['Insert'];
type AccessRequestInsert = Tables['access_requests']['Insert'];

export async function checkStudentLevelAccess(
  studentId: string,
  levelId: number
): Promise<boolean> {
  const supabase = createClient();

  // 1️⃣ Hardcoded beginner level
  if (levelId === 2) return true;

  // 2️⃣ Check if student has approved access
  const { data: accessData, error: accessError } = await supabase
    .from('access_requests')
    .select('id')
    .eq('student_id', studentId)
    .eq('level_id', levelId)
    .eq('status', 'approved')
    .single();

  if (accessError && accessError.code !== 'PGRST116') {
    throw new Error(`Failed to check level access: ${accessError.message}`);
  }

  return !!accessData;
}

/**
 * Get all levels a student has access to
 */
export async function getStudentAccessibleLevels(
  studentId: string
): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('level_access')
    .select('level')
    .eq('student_id', studentId);

  if (error) {
    throw new Error(`Failed to fetch accessible levels: ${error.message}`);
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
 * Create an access request for a level
 */
export async function createAccessRequest(
  studentId: string,
  levelId: number
): Promise<string> {
  const supabase = createClient();

  // 1️⃣ Check if there's already a pending request
  const { data: existingRequest } = await supabase
    .from('access_requests')
    .select('id, status')
    .eq('student_id', studentId)
    .eq('level_id', levelId)
    .eq('status', 'pending')
    .single();

  if (existingRequest) {
    throw new Error('You already have a pending request for this level');
  }

  // 2️⃣ Check if student already has access
  const hasAccess = await checkStudentLevelAccess(studentId, levelId);
  if (hasAccess) {
    throw new Error('You already have access to this level');
  }

  // 3️⃣ Insert new access request
  const { data, error } = await supabase
    .from('access_requests')
    .insert({
      student_id: studentId,
      level_id: levelId,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create access request: ${error.message}`);
  }

  return data.id;
}

/**
 * Get access requests for a student
 */
export async function getStudentAccessRequests(
  studentId: string,
  status?: 'pending' | 'approved' | 'denied'
): Promise<AccessRequestRow[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('access_requests')
    .select('*')
    .eq('student_id', studentId)
    .order('requested_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch access requests: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all pending access requests (for admin use)
 */
export async function getPendingAccessRequests(): Promise<Array<{
  id: string;
  studentId: string;
  studentName: string;
  level: string;
  requestedAt: string;
}>> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('access_requests')
    .select(`
      id,
      student_id,
      level,
      requested_at,
      students!inner(fullName)
    `)
    .eq('status', 'pending')
    .order('requested_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch pending access requests: ${error.message}`);
  }

  return (data || []).map(request => ({
    id: request.id,
    studentId: request.student_id || '',
    studentName: (request.students as any)?.fullName || 'Unknown Student',
    level: request.level,
    requestedAt: request.requested_at || '',
  }));
}

/**
 * Approve an access request
 */
export async function approveAccessRequest(
  requestId: string,
  adminId: string
): Promise<void> {
  const supabase = createClient();
  
  // Get the request details first
  const { data: request, error: fetchError } = await supabase
    .from('access_requests')
    .select('student_id, level, status')
    .eq('id', requestId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch access request: ${fetchError.message}`);
  }

  if (!request) {
    throw new Error('Access request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Access request is not pending');
  }

  if (!request.student_id) {
    throw new Error('Invalid access request: missing student ID');
  }

  // Check if student already has access
  const hasAccess = await checkStudentLevelAccess(request.student_id, request.level);
  if (hasAccess) {
    // Update request status to approved anyway
    await supabase
      .from('access_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq('id', requestId);
    return;
  }

  // Start a transaction-like operation
  const accessData: LevelAccessInsert = {
    student_id: request.student_id,
    level: request.level,
    granted_by: adminId,
  };

  // Grant access
  const { error: accessError } = await supabase
    .from('level_access')
    .insert(accessData);

  if (accessError) {
    throw new Error(`Failed to grant access: ${accessError.message}`);
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('access_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq('id', requestId);

  if (updateError) {
    throw new Error(`Failed to update request status: ${updateError.message}`);
  }
}

/**
 * Deny an access request
 */
export async function denyAccessRequest(
  requestId: string,
  adminId: string
): Promise<void> {
  const supabase = createClient();
  
  // Check if request exists and is pending
  const { data: request, error: fetchError } = await supabase
    .from('access_requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch access request: ${fetchError.message}`);
  }

  if (!request) {
    throw new Error('Access request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Access request is not pending');
  }

  const { error } = await supabase
    .from('access_requests')
    .update({
      status: 'denied',
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq('id', requestId);

  if (error) {
    throw new Error(`Failed to deny access request: ${error.message}`);
  }
}

/**
 * Revoke level access for a student
 */
export async function revokeLevelAccess(
  studentId: string,
  level: string,
  adminId: string
): Promise<void> {
  // Cannot revoke beginner level access
  if (level.toLowerCase() === 'beginner') {
    throw new Error('Cannot revoke access to beginner level');
  }

  const supabase = createClient();
  
  const { error } = await supabase
    .from('level_access')
    .delete()
    .eq('student_id', studentId)
    .eq('level', level);

  if (error) {
    throw new Error(`Failed to revoke level access: ${error.message}`);
  }
}

/**
 * Get all students with access to a specific level
 */
export async function getStudentsWithLevelAccess(
  level: string
): Promise<Array<{
  studentId: string;
  studentName: string;
  grantedAt: string;
  grantedBy: string;
}>> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('level_access')
    .select(`
      student_id,
      granted_at,
      granted_by,
      students!inner(fullName)
    `)
    .eq('level', level)
    .order('granted_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch students with level access: ${error.message}`);
  }

  return (data || []).map(access => ({
    studentId: access.student_id || '',
    studentName: (access.students as any)?.fullName || 'Unknown Student',
    grantedAt: access.granted_at || '',
    grantedBy: access.granted_by || '',
  }));
}

/**
 * Check if a student has a pending access request for a level
 */
export async function hasPendingAccessRequest(
  studentId: string,
  level: string
): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('access_requests')
    .select('id')
    .eq('student_id', studentId)
    .eq('level', level)
    .eq('status', 'pending')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw new Error(`Failed to check pending access request: ${error.message}`);
  }

  return !!data;
}

/**
 * Get access request status for a student and level
 */
export async function getAccessRequestStatus(
  studentId: string,
  level: string
): Promise<'none' | 'pending' | 'approved' | 'denied'> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('access_requests')
    .select('status')
    .eq('student_id', studentId)
    .eq('level', level)
    .order('requested_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw new Error(`Failed to check access request status: ${error.message}`);
  }

  if (!data) {
    return 'none';
  }

  return data.status as 'pending' | 'approved' | 'denied';
}

/**
 * Bulk approve multiple access requests
 */
export async function bulkApproveAccessRequests(
  requestIds: string[],
  adminId: string
): Promise<{
  successful: string[];
  failed: Array<{ requestId: string; error: string }>;
}> {
  const successful: string[] = [];
  const failed: Array<{ requestId: string; error: string }> = [];

  for (const requestId of requestIds) {
    try {
      await approveAccessRequest(requestId, adminId);
      successful.push(requestId);
    } catch (error) {
      failed.push({
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { successful, failed };
}

/**
 * Bulk deny multiple access requests
 */
export async function bulkDenyAccessRequests(
  requestIds: string[],
  adminId: string
): Promise<{
  successful: string[];
  failed: Array<{ requestId: string; error: string }>;
}> {
  const successful: string[] = [];
  const failed: Array<{ requestId: string; error: string }> = [];

  for (const requestId of requestIds) {
    try {
      await denyAccessRequest(requestId, adminId);
      successful.push(requestId);
    } catch (error) {
      failed.push({
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { successful, failed };
}