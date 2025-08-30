import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";

type Tables = Database["public"]["Tables"];
type AccessRequestRow = Tables["access_requests"]["Row"];

export async function checkStudentLevelAccess(
  studentId: string,
  levelId: number
): Promise<boolean> {
  const supabase = createClient();
  console.log(studentId, levelId);
  if (levelId === 2) return true;

  const { data: accessData, error: accessError } = await supabase
    .from("access_requests")
    .select("id")
    .eq("student_id", studentId)
    .eq("level_id", levelId)
    .eq("status", "approved");

  if (accessError && accessError.code !== "PGRST116") {
    throw new Error(`Failed to check level access: ${accessError.message}`);
  }
  console.log(accessData);
  return Boolean(accessData && accessData.length > 0);
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
    .from("access_requests")
    .select("id, status")
    .eq("student_id", studentId)
    .eq("level_id", levelId)
    .eq("status", "pending")
    .single();

  if (existingRequest) {
    throw new Error("You already have a pending request for this level");
  }

  // 2️⃣ Check if student already has access
  const hasAccess = await checkStudentLevelAccess(studentId, levelId);
  console.log("hasAccess", hasAccess);
  if (hasAccess) {
    throw new Error("You already have access to this level");
  }

  // 3️⃣ Insert new access request
  const { data, error } = await supabase
    .from("access_requests")
    .insert({
      student_id: studentId,
      level_id: levelId,
      status: "pending",
    })
    .select("id")
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
  status?: "pending" | "approved" | "denied"
): Promise<AccessRequestRow[]> {
  const supabase = createClient();

  let query = supabase
    .from("access_requests")
    .select("*")
    .eq("student_id", studentId)
    .order("requested_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
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
export async function getPendingAccessRequests(): Promise<
  Array<{
    id: string;
    studentId: string;
    studentName: string;
    levelId: number;
    levelName: string;
    requestedAt: string;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("access_requests")
    .select(
      `
      id,
      student_id,
      level_id,
      requested_at,
      students!inner(full_name),
      levels!inner(name)
    `
    )
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch pending access requests: ${error.message}`
    );
  }

  return (data || []).map((request) => ({
    id: request.id,
    studentId: request.student_id || "",
    studentName: (request.students as any)?.full_name || "Unknown Student",
    levelId: request.level_id || 0,
    levelName: (request.levels as any)?.name || "Unknown Level",
    requestedAt: request.requested_at || "",
  }));
}

/**
 * Approve an access request
 */
export async function approveAccessRequest(
  requestId: string,
  adminId: string
): Promise<void> {
  const supabase = await createClient();

  // Get the request details first
  const { data: request, error: fetchError } = await supabase
    .from("access_requests")
    .select("student_id, level_id, status")
    .eq("id", requestId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch access request: ${fetchError.message}`);
  }

  if (!request) {
    throw new Error("Access request not found");
  }

  if (request.status !== "pending") {
    throw new Error("Access request is not pending");
  }

  if (!request.student_id) {
    throw new Error("Invalid access request: missing student ID");
  }
  if (!request.level_id) {
    throw new Error("Invalid access request: missing level ID");
  }

  // Check if student already has access
  const hasAccess = await checkStudentLevelAccess(
    request.student_id,
    request.level_id
  );

  if (!hasAccess) {
    // Grant access by inserting into student_levels
    const { error: insertError } = await supabase
      .from("access_requests")
      .insert({
        student_id: request.student_id,
        level_id: request.level_id,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        status: "approved",
      });

    if (insertError) {
      throw new Error(
        `Failed to grant access to student: ${insertError.message}`
      );
    }
  }

  // Update request status to approved
  const { error: updateError } = await supabase
    .from("access_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", requestId);

  if (updateError) {
    throw new Error(`Failed to approve access request: ${updateError.message}`);
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
    .from("access_requests")
    .select("status")
    .eq("id", requestId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch access request: ${fetchError.message}`);
  }

  if (!request) {
    throw new Error("Access request not found");
  }

  if (request.status !== "pending") {
    throw new Error("Access request is not pending");
  }

  const { error } = await supabase
    .from("access_requests")
    .update({
      status: "denied",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Failed to deny access request: ${error.message}`);
  }
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
        error: error instanceof Error ? error.message : "Unknown error",
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
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { successful, failed };
}
