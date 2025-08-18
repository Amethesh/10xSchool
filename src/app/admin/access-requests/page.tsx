'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatLevelName } from '@/utils/levelUtils';

interface AccessRequest {
  id: string;
  studentId: string;
  studentName: string;
  level: string;
  requestedAt: string;
}

// Fetch pending access requests
async function fetchPendingAccessRequests(): Promise<AccessRequest[]> {
  const response = await fetch('/api/admin/access-requests');
  if (!response.ok) {
    throw new Error('Failed to fetch access requests');
  }
  const data = await response.json();
  return data.requests;
}

// Process access request (approve/deny)
async function processAccessRequest(requestId: string, action: 'approve' | 'deny') {
  const response = await fetch('/api/admin/access-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      requestId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process request');
  }

  return response.json();
}

// Bulk process access requests
async function bulkProcessAccessRequests(requestIds: string[], action: 'approve' | 'deny') {
  const response = await fetch('/api/admin/access-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      requestIds,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process requests');
  }

  return response.json();
}

export default function AccessRequestsPage() {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch pending requests
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['admin-access-requests'],
    queryFn: fetchPendingAccessRequests,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Single request mutations
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => processAccessRequest(requestId, 'approve'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-requests'] });
      toast.success('Access request approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const denyMutation = useMutation({
    mutationFn: (requestId: string) => processAccessRequest(requestId, 'deny'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-requests'] });
      toast.success('Access request denied');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Bulk mutations
  const bulkApproveMutation = useMutation({
    mutationFn: (requestIds: string[]) => bulkProcessAccessRequests(requestIds, 'approve'),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-requests'] });
      setSelectedRequests([]);
      toast.success(`Approved ${result.successful.length} requests`);
      if (result.failed.length > 0) {
        toast.warning(`${result.failed.length} requests failed to process`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDenyMutation = useMutation({
    mutationFn: (requestIds: string[]) => bulkProcessAccessRequests(requestIds, 'deny'),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-requests'] });
      setSelectedRequests([]);
      toast.success(`Denied ${result.successful.length} requests`);
      if (result.failed.length > 0) {
        toast.warning(`${result.failed.length} requests failed to process`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === requests?.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests?.map(r => r.id) || []);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading access requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <CardTitle>Error Loading Requests</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Failed to load access requests'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Access Requests Management</h1>
        <p className="text-muted-foreground">
          Review and manage student requests for level access
        </p>
      </div>

      {/* Summary Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Request Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {requests?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedRequests.length}
              </div>
              <div className="text-sm text-muted-foreground">Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(requests?.map(r => r.level)).size || 0}
              </div>
              <div className="text-sm text-muted-foreground">Unique Levels</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {requests && requests.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRequests.length === requests.length}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <span className="text-sm">
                  Select All ({selectedRequests.length} selected)
                </span>
              </div>
              
              {selectedRequests.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => bulkApproveMutation.mutate(selectedRequests)}
                    disabled={bulkApproveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {bulkApproveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve Selected ({selectedRequests.length})
                  </Button>
                  <Button
                    onClick={() => bulkDenyMutation.mutate(selectedRequests)}
                    disabled={bulkDenyMutation.isPending}
                    variant="destructive"
                  >
                    {bulkDenyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Deny Selected ({selectedRequests.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground">
              All access requests have been processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleSelectRequest(request.id)}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium">{request.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        Student ID: {request.studentId}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {formatLevelName(request.level)}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(request.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => denyMutation.mutate(request.id)}
                        disabled={denyMutation.isPending}
                      >
                        {denyMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}