"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, X, Inbox } from "lucide-react";
import { toast } from "sonner";
import { formatLevelName } from "@/utils/levelUtils";
import { motion, AnimatePresence } from "motion/react";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { avatarTint, initials } from "@/components/admin/avatar";

interface AccessRequest {
  id: string;
  studentId: string;
  studentName: string;
  levelName: string;
  levelId: number;
  requestedAt: string;
}

// Fetch pending access requests
async function fetchPendingAccessRequests(): Promise<AccessRequest[]> {
  const response = await fetch("/api/admin/access-requests");
  if (!response.ok) {
    throw new Error("Failed to fetch access requests");
  }
  const data = await response.json();
  return data.requests;
}

// Process access request (approve/deny)
async function processAccessRequest(
  requestId: string,
  action: "approve" | "deny"
) {
  const response = await fetch("/api/admin/access-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      requestId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process request");
  }

  return response.json();
}

// Bulk process access requests
async function bulkProcessAccessRequests(
  requestIds: string[],
  action: "approve" | "deny"
) {
  const response = await fetch("/api/admin/access-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      requestIds,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process requests");
  }

  return response.json();
}

/** How long a request has been sitting — the thing that matters in a queue. */
function waitingFor(iso: string): string {
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 86_400_000
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default function AccessRequestsPage() {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch pending requests
  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-access-requests"],
    queryFn: fetchPendingAccessRequests,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Single request mutations
  const approveMutation = useMutation({
    mutationFn: (requestId: string) =>
      processAccessRequest(requestId, "approve"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-access-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-requests-count"],
      });
      toast.success("Access approved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => setProcessingId(null),
  });

  const denyMutation = useMutation({
    mutationFn: (requestId: string) => processAccessRequest(requestId, "deny"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-access-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-requests-count"],
      });
      toast.success("Access denied");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => setProcessingId(null),
  });

  // Bulk mutations
  const bulkApproveMutation = useMutation({
    mutationFn: (requestIds: string[]) =>
      bulkProcessAccessRequests(requestIds, "approve"),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-access-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-requests-count"],
      });
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
    mutationFn: (requestIds: string[]) =>
      bulkProcessAccessRequests(requestIds, "deny"),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-access-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-requests-count"],
      });
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
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === requests?.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests?.map((r) => r.id) || []);
    }
  };

  const isBulkBusy =
    bulkApproveMutation.isPending || bulkDenyMutation.isPending;

  const stats = React.useMemo(() => {
    const list = requests ?? [];
    return {
      pending: list.length,
      students: new Set(list.map((r) => r.studentId)).size,
      levels: new Set(list.map((r) => r.levelId)).size,
    };
  }, [requests]);

  if (isLoading) {
    return (
      <div className="ac-root flex items-center justify-center p-6">
        <div className="text-center">
          <p className="ac-display text-xl text-[#141414] mb-4">
            Checking the queue
          </p>
          <div className="flex gap-1.5 justify-center">
            {["#f0df6e", "#cfe0b4", "#b4c48d", "#a6bedb"].map((c, i) => (
              <span
                key={c}
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ background: c, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ac-root flex items-center justify-center p-6">
        <div className="ac-card p-8 max-w-md text-center">
          <p className="ac-display text-xl text-[#141414] mb-2">
            The queue didn&apos;t load
          </p>
          <p className="text-sm text-[#8c8578] mb-6">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin-access-requests"],
              })
            }
            className="ac-btn ac-btn-primary"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ac-root">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-5">
        <AdminTopBar active="requests" />

        <h1 className="ac-display text-[32px] sm:text-[40px] leading-tight text-[#141414]">
          Access requests
        </h1>
        <p className="text-sm text-[#8c8578] mt-2 mb-6 max-w-xl">
          {stats.pending === 0
            ? "Nothing waiting. Students appear here when they ask to unlock a level."
            : `${stats.pending} ${
                stats.pending === 1 ? "request" : "requests"
              } from ${stats.students} ${
                stats.students === 1 ? "student" : "students"
              }, across ${stats.levels} ${
                stats.levels === 1 ? "level" : "levels"
              }.`}
        </p>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          <div className="ac-card ac-card-yellow p-5">
            <svg
              className="ac-card-art"
              width="100"
              height="100"
              viewBox="0 0 60 60"
              fill="#141414"
            >
              <rect x="12" y="0" width="36" height="12" />
              <rect x="18" y="12" width="24" height="12" />
              <rect x="24" y="24" width="12" height="12" />
              <rect x="18" y="36" width="24" height="12" />
              <rect x="12" y="48" width="36" height="12" />
            </svg>
            <div className="ac-stat ac-num !text-3xl">{stats.pending}</div>
            <div className="ac-caption mt-2">Waiting</div>
          </div>
          <div className="ac-card ac-card-blue p-5">
            <svg
              className="ac-card-art"
              width="100"
              height="100"
              viewBox="0 0 60 60"
              fill="#141414"
            >
              <rect x="12" y="0" width="24" height="12" />
              <rect x="0" y="12" width="12" height="24" />
              <rect x="12" y="12" width="24" height="24" />
              <rect x="36" y="24" width="12" height="12" />
            </svg>
            <div className="ac-stat ac-num !text-3xl">{stats.students}</div>
            <div className="ac-caption mt-2">Students</div>
          </div>
          <div className="ac-card ac-card-green p-5">
            <svg
              className="ac-card-art"
              width="100"
              height="100"
              viewBox="0 0 60 60"
              fill="#141414"
            >
              <rect x="0" y="12" width="60" height="12" />
              <rect x="12" y="24" width="36" height="12" />
              <rect x="24" y="36" width="12" height="12" />
            </svg>
            <div className="ac-stat ac-num !text-3xl">{stats.levels}</div>
            <div className="ac-caption mt-2">Levels</div>
          </div>
        </div>

        {/* Queue */}
        {!requests || requests.length === 0 ? (
          <div className="ac-card p-12 text-center">
            <Inbox className="w-10 h-10 text-[#d8d0c1] mx-auto mb-4" />
            <p className="ac-display text-xl text-[#141414] mb-2">All clear</p>
            <p className="text-sm text-[#8c8578]">
              No requests are waiting for a decision.
            </p>
          </div>
        ) : (
          <div className="ac-card overflow-hidden">
            {/* Bulk bar */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-[#e7e0d3]">
              <label className="flex items-center gap-2.5 text-sm text-[#2c2a26] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedRequests.length === requests.length}
                  onChange={handleSelectAll}
                  className="ac-checkbox"
                />
                Select all
              </label>

              <AnimatePresence>
                {selectedRequests.length > 0 && (
                  <motion.div
                    className="flex items-center gap-2 ml-auto"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    <span className="text-xs text-[#8c8578] mr-1">
                      {selectedRequests.length} selected
                    </span>
                    <button
                      onClick={() =>
                        bulkApproveMutation.mutate(selectedRequests)
                      }
                      disabled={isBulkBusy}
                      className="ac-btn ac-btn-approve !min-h-9 !text-[13px]"
                    >
                      {bulkApproveMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => bulkDenyMutation.mutate(selectedRequests)}
                      disabled={isBulkBusy}
                      className="ac-btn ac-btn-danger !min-h-9 !text-[13px]"
                    >
                      {bulkDenyMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      Deny
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {requests.map((request) => {
                const isSelected = selectedRequests.includes(request.id);
                const isBusy = processingId === request.id;

                return (
                  <motion.div
                    key={request.id}
                    layout
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex flex-wrap items-center gap-4 px-5 py-4 border-b border-[#e7e0d3] last:border-b-0 transition-colors ${
                      isSelected ? "bg-[#e9f2dd]" : "hover:bg-[#faf7f0]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRequest(request.id)}
                      className="ac-checkbox"
                      aria-label={`Select ${request.studentName}`}
                    />

                    <span
                      className="ac-avatar"
                      style={{ background: avatarTint(request.studentId) }}
                    >
                      {initials(request.studentName)}
                    </span>

                    <div className="min-w-0 mr-auto">
                      <div className="text-[#141414] font-medium leading-tight truncate">
                        {request.studentName}
                      </div>
                      <div className="ac-num text-xs text-[#8c8578] mt-0.5">
                        {request.studentId}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="ac-pill">
                        {formatLevelName(request.levelName)}
                      </span>
                      <div className="text-[11px] text-[#8c8578] mt-1">
                        {waitingFor(request.requestedAt)}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setProcessingId(request.id);
                          approveMutation.mutate(request.id);
                        }}
                        disabled={isBusy || isBulkBusy}
                        className="ac-btn ac-btn-approve !min-h-9 !text-[13px]"
                      >
                        {isBusy && approveMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setProcessingId(request.id);
                          denyMutation.mutate(request.id);
                        }}
                        disabled={isBusy || isBulkBusy}
                        className="ac-btn ac-btn-danger !min-h-9 !text-[13px]"
                      >
                        {isBusy && denyMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        Deny
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
