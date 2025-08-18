'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

// Custom hook to get current user
function useUser() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return user;
}
import { useLevelAccess } from '@/hooks/use-level-access';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LevelAccessButton } from './LevelAccessButton';

interface LevelAccessGuardProps {
  level: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showRequestButton?: boolean;
}

export function LevelAccessGuard({
  level,
  children,
  fallback,
  redirectTo = '/student/levels',
  showRequestButton = true,
}: LevelAccessGuardProps) {
  const user = useUser();
  const router = useRouter();
  const { data: hasAccess, isLoading, error } = useLevelAccess(level);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Show loading state
  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <CardTitle>Access Check Failed</CardTitle>
            <CardDescription>
              Unable to verify your access permissions for this level.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push(redirectTo)}>
              Go Back to Levels
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access granted - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show default access denied UI
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <CardTitle>Level Access Required</CardTitle>
          <CardDescription>
            You need permission to access <strong>{level}</strong> level content.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {showRequestButton && (
            <LevelAccessButton
              level={level}
              className="w-full"
              onAccessGranted={() => {
                // Refresh the page or trigger a re-render
                window.location.reload();
              }}
            />
          )}
          <Button 
            variant="outline" 
            onClick={() => router.push(redirectTo)}
            className="w-full"
          >
            Go Back to Levels
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook version for use in components
export function useLevelAccessGuard(level: string) {
  const user = useUser();
  const router = useRouter();
  const { data: hasAccess, isLoading, error } = useLevelAccess(level);

  const redirectToLogin = React.useCallback(() => {
    router.push('/login');
  }, [router]);

  const redirectToLevels = React.useCallback(() => {
    router.push('/student/levels');
  }, [router]);

  return {
    user,
    hasAccess: hasAccess ?? false,
    isLoading,
    error,
    isAuthenticated: !!user,
    canAccess: !!user && hasAccess,
    redirectToLogin,
    redirectToLevels,
  };
}

// Simplified guard for inline use
export function InlineLevelAccessGuard({
  level,
  children,
  fallback = <div>Access denied</div>,
}: {
  level: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { data: hasAccess, isLoading } = useLevelAccess(level);

  if (isLoading) {
    return <Loader2 className="w-4 h-4 animate-spin" />;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}