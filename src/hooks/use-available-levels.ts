'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

// Default level hierarchy for fallback
const DEFAULT_LEVEL_ORDER = [
  'beginner',
  'movers',
  'flyers',
  'ket',
  'pet',
  'fce',
  'cae',
  'cpe',
];

/**
 * Hook to fetch available levels from the database
 */
export function useAvailableLevels() {
  return useQuery<string[]>({
    queryKey: ['available-levels'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('math_questions')
        .select('level')
        .order('level');

      if (error) {
        console.error('Error fetching levels:', error);
        return DEFAULT_LEVEL_ORDER;
      }

      // Extract unique levels and sort them
      const uniqueLevels = [...new Set(data?.map(l => l.level.toLowerCase()) || [])];
      
      // Sort according to default order, with unknown levels at the end
      const sortedLevels = uniqueLevels.sort((a, b) => {
        const aIndex = DEFAULT_LEVEL_ORDER.indexOf(a);
        const bIndex = DEFAULT_LEVEL_ORDER.indexOf(b);
        
        if (aIndex === -1 && bIndex === -1) {
          return a.localeCompare(b); // Alphabetical for unknown levels
        }
        if (aIndex === -1) return 1; // Unknown levels go to end
        if (bIndex === -1) return -1; // Unknown levels go to end
        
        return aIndex - bIndex; // Use predefined order
      });

      return sortedLevels;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}