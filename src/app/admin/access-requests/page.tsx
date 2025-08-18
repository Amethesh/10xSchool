'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle, XCircle, Clock, Users, AlertCircle, ArrowBigLeft, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatLevelName } from '@/utils/levelUtils';
import { motion, Variants, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import Image from 'next/image';

interface AccessRequest {
  id: string;
  studentId: string;
  studentName: string;
  levelName: string;
  levelId: number;
  requestedAt: string;
}

// --- Animation Variants ---
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const fadeInItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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

  // --- Loading and Error States (Themed) ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 pixel-font text-cyan-300">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-40"
          style={{ backgroundImage: "url('/images/8bitBG6.png')" }}
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className='pixel-panel backdrop-blur-lg flex flex-col justify-center items-center p-4'>
          <Loader2 className="w-8 h-8 mb-4 animate-spin" />
          <p>LOADING ACCESS REQUESTS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="pixel-panel p-8 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="pixel-font text-lg text-white mb-2">Error Loading Data</h2>
          <p className="pixel-font text-xs text-red-400/80 mb-6">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <button className="pixel-button" onClick={() => window.location.reload()}>
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <>
      <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/8bitBG6.png')" }}
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
      <motion.div 
        className="pixel-panel backdrop-blur-lg max-w-5xl mx-auto p-4 mt-6 sm:p-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div className="mb-8 flex gap-4 items-center" variants={fadeInItem}>
          <div className='p-4'>
            <a
              href="/admin/dashboard"
              className="pixel-button pixel-button-secondary flex items-center"
              >
              <ChevronLeft  className="w-6 h-6" />
            </a>
          </div>
          <div>
            <h1 className="pixel-font text-2xl sm:text-3xl text-white mb-2">ACCESS REQUESTS</h1>
            <p className="pixel-font text-sm text-cyan-300/80">
              Manage student requests for level access.
            </p>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" variants={staggerContainer}>
          <div className="pixel-panel !p-4 text-center">
            <div className="pixel-font text-3xl font-bold text-yellow-400">{requests?.length || 0}</div>
            <div className="pixel-font text-xs text-cyan-300/70 mt-1">Pending Requests</div>
          </div>
          <div className="pixel-panel !p-4 text-center">
            <div className="pixel-font text-3xl font-bold text-blue-400">{selectedRequests.length}</div>
            <div className="pixel-font text-xs text-cyan-300/70 mt-1">Selected</div>
          </div>
          <div className="pixel-panel !p-4 text-center">
            <div className="pixel-font text-3xl font-bold text-green-400">{new Set(requests?.map(r => r.levelId)).size || 0}</div>
            <div className="pixel-font text-xs text-cyan-300/70 mt-1">Unique Levels</div>
          </div>
        </motion.div>

        {/* Bulk Actions */}
        {requests && requests.length > 0 && (
          <motion.div className="pixel-panel p-4 mb-6" variants={fadeInItem}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="flex items-center gap-3 pixel-font text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRequests.length > 0 && selectedRequests.length === requests.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 bg-cyan-900/50 border-cyan-400/50 text-cyan-400 focus:ring-cyan-400"
                />
                Select All ({selectedRequests.length} selected)
              </label>
              
              <AnimatePresence>
                {selectedRequests.length > 0 && (
                  <motion.div
                    className="flex gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <button
                      onClick={() => bulkApproveMutation.mutate(selectedRequests)}
                      disabled={bulkApproveMutation.isPending}
                      className="pixel-button-small flex items-center gap-2"
                    >
                      {bulkApproveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => bulkDenyMutation.mutate(selectedRequests)}
                      disabled={bulkDenyMutation.isPending}
                      className="pixel-button-secondary-small flex items-center gap-2"
                    >
                      {bulkDenyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Deny
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Requests List */}
        {!requests || requests.length === 0 ? (
          <motion.div className="pixel-panel p-12 text-center" variants={fadeInItem}>
            <Clock className="w-12 h-12 mx-auto mb-4 text-cyan-400/50" />
            <h3 className="pixel-font text-lg text-white mb-2">All Clear!</h3>
            <p className="pixel-font text-sm text-cyan-300/70">No pending access requests.</p>
          </motion.div>
        ) : (
          <motion.div className="space-y-4" variants={staggerContainer}>
            <AnimatePresence>
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  className={clsx(
                    "pixel-panel !p-4 transition-colors",
                    selectedRequests.includes(request.id) ? "bg-blue-500/15 border-blue-400" : "bg-cyan-900/20"
                  )}
                  variants={fadeInItem}
                  layout
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left Side: Selection & Student Info */}
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelectRequest(request.id)}
                        className="w-5 h-5 bg-cyan-900/50 border-cyan-400/50 text-cyan-400 focus:ring-cyan-400 flex-shrink-0"
                      />
                      <div>
                        <div className="pixel-font text-base text-white">{request.studentName}</div>
                        <div className="pixel-font text-xs text-cyan-300/60">
                          ID: {request.studentId}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side: Level Info & Actions */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                      <div className="text-right">
                        <div className="pixel-font text-xs px-2 py-1 bg-cyan-400/10 text-cyan-300 rounded mb-1">
                          {formatLevelName(request.levelName)}
                        </div>
                        <div className="pixel-font text-[10px] text-cyan-300/50">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          title="Approve"
                          onClick={() => approveMutation.mutate(request.id)}
                          disabled={approveMutation.isPending || denyMutation.isPending}
                          className="pixel-button !p-2 sm:!p-3"
                        >
                          {approveMutation.isPending && !denyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          title="Deny"
                          onClick={() => denyMutation.mutate(request.id)}
                          disabled={denyMutation.isPending || approveMutation.isPending}
                          className="pixel-button-secondary !p-2 sm:!p-3"
                        >
                          {denyMutation.isPending && !approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}