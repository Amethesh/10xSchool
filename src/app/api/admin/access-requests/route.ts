import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
  getPendingAccessRequests,
  approveAccessRequest,
  denyAccessRequest,
  bulkApproveAccessRequests,
  bulkDenyAccessRequests,
} from '@/lib/quiz/level-access';
import { checkAdminRole } from '@/lib/quiz/level-access-server';

/**
 * GET /api/admin/access-requests
 * Get all pending access requests (admin only)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const requests = await getPendingAccessRequests();
    
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching access requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/access-requests
 * Approve or deny access requests (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, requestId, requestIds } = body;

    if (!action || (!requestId && !requestIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: action and requestId/requestIds' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'approve':
        if (requestIds && Array.isArray(requestIds)) {
          result = await bulkApproveAccessRequests(requestIds, user.id);
        } else if (requestId) {
          await approveAccessRequest(requestId, user.id);
          result = { success: true };
        } else {
          return NextResponse.json(
            { error: 'Invalid request format' },
            { status: 400 }
          );
        }
        break;

      case 'deny':
        if (requestIds && Array.isArray(requestIds)) {
          result = await bulkDenyAccessRequests(requestIds, user.id);
        } else if (requestId) {
          await denyAccessRequest(requestId, user.id);
          result = { success: true };
        } else {
          return NextResponse.json(
            { error: 'Invalid request format' },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "approve" or "deny"' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing access request:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}