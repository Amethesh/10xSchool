import { NextRequest, NextResponse } from 'next/server';
import { createAccessRequest } from '@/lib/quiz/level-access';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/student/access-request
 * Create an access request for a level
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1️⃣ Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2️⃣ Parse request body
    const body = await request.json();
    const { level } = body;

    if (!level || typeof level !== 'string' || level.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid level format' }, { status: 400 });
    }

    const levelName = level.trim().toLowerCase();

    // 3️⃣ Verify level exists in DB
    const { data: levelData, error: levelError } = await supabase
      .from('levels')
      .select('id, difficulty_level')
      .ilike('name', levelName)
      .single();
    console.log(levelData)
    if (levelError || !levelData) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    const levelId = levelData.id;

    // 4️⃣ Prevent requesting beginner level (difficulty_level = 1)
    if (levelData.difficulty_level === 1) {
      return NextResponse.json({ error: 'Beginner level is always accessible' }, { status: 400 });
    }

    // 5️⃣ Create access request
    const requestId = await createAccessRequest(user.id, levelId);

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Access request created successfully'
    });

  } catch (error) {
    console.error('Error creating access request:', error);

    if (error instanceof Error) {
      if (error.message.includes('already have a pending request')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('already have access')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
