"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface PerformanceMetrics {
  queryCount: number;
  cacheHitRate: number;
  averageQueryTime: number;
  slowQueries: Array<{
    queryKey: string;
    duration: number;
    timestamp: number;
  }>;
  memoryUsage: {
    cacheSize: number;
    queryCount: number;
  };
}

/**
 * Hook for monitoring React Query performance and cache efficiency
 */
export function usePerformanceMonitoring() {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryCount: 0,
    cacheHitRate: 0,
    averageQueryTime: 0,
    slowQueries: [],
    memoryUsage: {
      cacheSize: 0,
      queryCount: 0,
    },
  });
  
  const queryTimes = useRef<number[]>([]);
  const cacheHits = useRef(0);
  const cacheMisses = useRef(0);
  const slowQueriesRef = useRef<PerformanceMetrics['slowQueries']>([]);
  
  useEffect(() => {
    const updateMetrics = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Calculate cache metrics
      const totalQueries = cacheHits.current + cacheMisses.current;
      const hitRate = totalQueries > 0 ? (cacheHits.current / totalQueries) * 100 : 0;
      
      // Calculate average query time
      const avgTime = queryTimes.current.length > 0 
        ? queryTimes.current.reduce((sum, time) => sum + time, 0) / queryTimes.current.length
        : 0;
      
      // Estimate cache size (rough approximation)
      const cacheSize = queries.reduce((size, query) => {
        const data = query.state.data;
        if (data) {
          try {
            return size + JSON.stringify(data).length;
          } catch {
            return size + 1000; // Rough estimate for non-serializable data
          }
        }
        return size;
      }, 0);
      
      setMetrics({
        queryCount: queries.length,
        cacheHitRate: hitRate,
        averageQueryTime: avgTime,
        slowQueries: [...slowQueriesRef.current].slice(-10), // Keep last 10 slow queries
        memoryUsage: {
          cacheSize,
          queryCount: queries.length,
        },
      });
    };
    
    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    
    // Initial update
    updateMetrics();
    
    return () => clearInterval(interval);
  }, [queryClient]);
  
  // Monitor query performance
  useEffect(() => {
    const cache = queryClient.getQueryCache();
    
    const unsubscribe = cache.subscribe((event) => {
      if (event?.type === 'observerAdded') {
        const startTime = performance.now();
        
        // Track when query completes
        const query = event.query;
        const originalOnSuccess = query.state.data;
        
        if (query.state.status === 'pending') {
          cacheMisses.current++;
          
          // Monitor for completion
          const checkCompletion = () => {
            if (query.state.status === 'success' || query.state.status === 'error') {
              const endTime = performance.now();
              const duration = endTime - startTime;
              
              queryTimes.current.push(duration);
              
              // Keep only last 100 query times for average calculation
              if (queryTimes.current.length > 100) {
                queryTimes.current = queryTimes.current.slice(-100);
              }
              
              // Track slow queries (>1000ms)
              if (duration > 1000) {
                const queryKey = JSON.stringify(query.queryKey);
                slowQueriesRef.current.push({
                  queryKey,
                  duration,
                  timestamp: Date.now(),
                });
                
                // Keep only last 50 slow queries
                if (slowQueriesRef.current.length > 50) {
                  slowQueriesRef.current = slowQueriesRef.current.slice(-50);
                }
              }
            } else {
              // Check again in 100ms
              setTimeout(checkCompletion, 100);
            }
          };
          
          checkCompletion();
        } else if (query.state.status === 'success') {
          // Cache hit
          cacheHits.current++;
        }
      }
    });
    
    return unsubscribe;
  }, [queryClient]);
  
  // Function to clear performance data
  const clearMetrics = () => {
    queryTimes.current = [];
    cacheHits.current = 0;
    cacheMisses.current = 0;
    slowQueriesRef.current = [];
    
    setMetrics({
      queryCount: 0,
      cacheHitRate: 0,
      averageQueryTime: 0,
      slowQueries: [],
      memoryUsage: {
        cacheSize: 0,
        queryCount: 0,
      },
    });
  };
  
  // Function to get cache statistics
  const getCacheStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      total: queries.length,
      fresh: queries.filter(q => q.isStale() === false).length,
      stale: queries.filter(q => q.isStale() === true).length,
      loading: queries.filter(q => q.state.status === 'pending').length,
      error: queries.filter(q => q.state.status === 'error').length,
      success: queries.filter(q => q.state.status === 'success').length,
    };
    
    return stats;
  };
  
  // Function to identify memory-heavy queries
  const getMemoryHeavyQueries = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return queries
      .map(query => {
        const data = query.state.data;
        let size = 0;
        
        if (data) {
          try {
            size = JSON.stringify(data).length;
          } catch {
            size = 1000; // Rough estimate
          }
        }
        
        return {
          queryKey: JSON.stringify(query.queryKey),
          size,
          lastUpdated: query.state.dataUpdatedAt,
          status: query.state.status,
        };
      })
      .sort((a, b) => b.size - a.size)
      .slice(0, 10); // Top 10 memory consumers
  };
  
  return {
    metrics,
    clearMetrics,
    getCacheStats,
    getMemoryHeavyQueries,
  };
}

/**
 * Hook for monitoring specific query performance
 */
export function useQueryPerformanceMonitor(queryKey: unknown[]) {
  const queryClient = useQueryClient();
  const [queryMetrics, setQueryMetrics] = useState({
    hitCount: 0,
    missCount: 0,
    averageTime: 0,
    lastFetch: null as Date | null,
    cacheAge: 0,
  });
  
  useEffect(() => {
    const cache = queryClient.getQueryCache();
    const query = cache.find({ queryKey });
    
    if (query) {
      const updateMetrics = () => {
        const state = query.state;
        const cacheAge = state.dataUpdatedAt ? Date.now() - state.dataUpdatedAt : 0;
        
        setQueryMetrics(prev => ({
          ...prev,
          cacheAge,
          lastFetch: state.dataUpdatedAt ? new Date(state.dataUpdatedAt) : null,
        }));
      };
      
      // Update immediately
      updateMetrics();
      
      // Subscribe to query changes
      const unsubscribe = query.subscribe(updateMetrics);
      
      return unsubscribe;
    }
  }, [queryClient, queryKey]);
  
  return queryMetrics;
}

/**
 * Development-only performance debugging component
 */
export function PerformanceDebugger() {
  const { metrics, getCacheStats, getMemoryHeavyQueries } = usePerformanceMonitoring();
  const [showDebugger, setShowDebugger] = useState(false);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  if (!showDebugger) {
    return (
      <button
        onClick={() => setShowDebugger(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded text-sm z-50"
      >
        Performance
      </button>
    );
  }
  
  const cacheStats = getCacheStats();
  const memoryHeavy = getMemoryHeavyQueries();
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance Monitor</h3>
        <button
          onClick={() => setShowDebugger(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Cache Hit Rate:</strong> {metrics.cacheHitRate.toFixed(1)}%
        </div>
        <div>
          <strong>Avg Query Time:</strong> {metrics.averageQueryTime.toFixed(0)}ms
        </div>
        <div>
          <strong>Cache Size:</strong> {(metrics.memoryUsage.cacheSize / 1024).toFixed(1)}KB
        </div>
        <div>
          <strong>Queries:</strong> {cacheStats.total} 
          ({cacheStats.fresh} fresh, {cacheStats.stale} stale)
        </div>
        
        {metrics.slowQueries.length > 0 && (
          <div>
            <strong>Recent Slow Queries:</strong>
            <div className="max-h-20 overflow-y-auto">
              {metrics.slowQueries.slice(-3).map((query, i) => (
                <div key={i} className="text-yellow-400">
                  {query.duration.toFixed(0)}ms: {query.queryKey.slice(0, 30)}...
                </div>
              ))}
            </div>
          </div>
        )}
        
        {memoryHeavy.length > 0 && (
          <div>
            <strong>Memory Heavy:</strong>
            <div className="max-h-20 overflow-y-auto">
              {memoryHeavy.slice(0, 2).map((query, i) => (
                <div key={i} className="text-orange-400">
                  {(query.size / 1024).toFixed(1)}KB: {query.queryKey.slice(0, 25)}...
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}