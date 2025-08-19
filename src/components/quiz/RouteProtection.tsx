'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { checkStudentLevelAccess } from '@/lib/quiz/level-access';
import { Lock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface RouteProtectionProps {
  level: number;
  children: React.ReactNode;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

export function RouteProtection({
  level,
  children,
  fallbackPath = '/student/levels',
  showAccessDenied = true
}: RouteProtectionProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }
        const access = await checkStudentLevelAccess(user.id, level);
        setHasAccess(access);

        // If no access and not showing access denied page, redirect
        if (!access && !showAccessDenied) {
          router.push(`${fallbackPath}?error=access_denied&level=${encodeURIComponent(level)}`);
        }
      } catch (err) {
        console.error('Error checking route access:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [level, router, fallbackPath, showAccessDenied]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
         <Image
          src={"/images/8bitBG2.png"}
          fill
          alt="BG"
          className="object-cover"
        />
        <div className="pixel-panel p-8 text-center">
          <div className="pixel-font text-white mb-4">Checking Access...</div>
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="pixel-panel p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="pixel-font text-red-400 mb-4">Access Error</div>
          <div className="pixel-font text-sm text-white mb-6">{error}</div>
          <button
            onClick={() => router.push(fallbackPath)}
            className="pixel-button"
          >
            BACK TO LEVELS
          </button>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!hasAccess && showAccessDenied) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="pixel-panel p-8 text-center max-w-md">
          <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <div className="pixel-font text-yellow-400 mb-4">Access Denied</div>
          <div className="pixel-font text-sm text-white mb-6">
            You don't have access to this level. 
            Please request access from your instructor.
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push(fallbackPath)}
              className="pixel-button w-full"
            >
              BACK TO LEVELS
            </button>
            <button
              onClick={() => router.push(`${fallbackPath}?requestAccess=${encodeURIComponent(level)}`)}
              className="pixel-button-secondary w-full"
            >
              REQUEST ACCESS
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Fallback - should not reach here
  return null;
}