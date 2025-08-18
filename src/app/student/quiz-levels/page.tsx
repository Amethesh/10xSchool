'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LevelAccessButton, LevelAccessBadge } from '@/components/quiz/LevelAccessButton';
import { useAccessibleLevels, useAccessRequests } from '@/hooks/use-level-access';
import { useAvailableLevels } from '@/hooks/use-available-levels';
import { formatLevelName, getLevelDescription } from '@/lib/quiz/level-access-utils';
import { Loader2, BookOpen, Trophy, Users } from 'lucide-react';

export default function QuizLevelsPage() {
  const { data: accessibleLevels, isLoading: levelsLoading } = useAccessibleLevels();
  const { data: accessRequests, isLoading: requestsLoading } = useAccessRequests();
  const { data: availableLevels = [], isLoading: availableLevelsLoading } = useAvailableLevels();

  if (levelsLoading || requestsLoading || availableLevelsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading quiz levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quiz Levels</h1>
        <p className="text-muted-foreground">
          Choose your difficulty level and start practicing math problems
        </p>
      </div>

      {/* Access Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {accessibleLevels?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Accessible Levels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {accessRequests?.filter(r => r.status === 'pending').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {availableLevels.length - (accessibleLevels?.length || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Locked Levels</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableLevels.map((level) => {
          const hasAccess = accessibleLevels?.includes(level) || false;
          const isLocked = !hasAccess && level !== 'beginner';
          
          return (
            <Card key={level} className={`transition-all duration-200 ${
              hasAccess ? 'border-green-200 bg-green-50' : 
              isLocked ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {formatLevelName(level)}
                  </CardTitle>
                  <LevelAccessBadge level={level} />
                </div>
                <CardDescription>
                  {getLevelDescription(level)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hasAccess ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ You have access to this level
                      </p>
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          onClick={() => {
                            // Navigate to quiz for this level
                            window.location.href = `/student/quiz/${level}/1`;
                          }}
                        >
                          Start Quiz
                        </button>
                        <button 
                          className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                          onClick={() => {
                            // Navigate to level overview
                            window.location.href = `/student/levels/${level}`;
                          }}
                        >
                          View Lessons
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Request access to unlock this level
                      </p>
                      <LevelAccessButton 
                        level={level}
                        className="w-full"
                        showBadge={false}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Access Requests */}
      {accessRequests && accessRequests.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Access Requests
            </CardTitle>
            <CardDescription>
              Track the status of your level access requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accessRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{formatLevelName(request.level)}</div>
                    <div className="text-sm text-muted-foreground">
                      Requested on {request.requested_at ? new Date(request.requested_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'denied' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}