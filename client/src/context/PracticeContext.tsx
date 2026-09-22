import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { ALL_PRACTICES, type Practice } from '../data/workbookPractices';
import { api } from '../services/api';

interface PracticeProgress {
  practiceId: string;
  attemptsMade: number;
  attemptsRequired: number;
  completed: boolean;
}

interface PracticeContextType {
  practices: Practice[];
  progressMap: Map<string, PracticeProgress>;
  isLoading: boolean;
  loadProgress: () => Promise<void>;
  updatePracticeProgress: (practiceId: string, progress: PracticeProgress) => void;
  invalidateCache: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [practices, setPractices] = useState<Practice[]>(ALL_PRACTICES);
  const [progressMap, setProgressMap] = useState<Map<string, PracticeProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  const loadProgress = useCallback(async (forceRefresh = false, signal?: AbortSignal) => {
    const now = Date.now();
    
    if (!forceRefresh && now - cacheTimestamp < CACHE_DURATION && progressMap.size > 0) {
      console.log('使用缓存的练习进度');
      return;
    }

    setIsLoading(true);
    try {
      const newProgressMap = new Map<string, PracticeProgress>();
      const updatedPractices = [...ALL_PRACTICES];
      
      for (let i = 0; i < updatedPractices.length; i++) {
        if (signal?.aborted) return;
        const practice = updatedPractices[i];
        try {
          const progress = await api.getPracticeProgress(practice.id);
          
          if (progress) {
            const progressData: PracticeProgress = {
              practiceId: practice.id,
              attemptsMade: progress.attempts_made || 0,
              attemptsRequired: progress.attempts_required || practice.attemptsRequired,
              completed: progress.completed === 1
            };
            newProgressMap.set(practice.id, progressData);
            
            updatedPractices[i] = {
              ...practice,
              attemptsMade: progress.attempts_made || 0,
              completed: progress.completed === 1
            };
          } else {
            newProgressMap.set(practice.id, {
              practiceId: practice.id,
              attemptsMade: 0,
              attemptsRequired: practice.attemptsRequired,
              completed: false
            });
          }
        } catch (error) {
          // 静默处理 abort 错误（StrictMode 双挂载或卸载时正常出现）
          if (signal?.aborted || (error instanceof Error && (error.name === 'AbortError' || error.message === 'Failed to fetch'))) {
            return;
          }
          console.error(`Error loading progress for ${practice.id}:`, error);
          newProgressMap.set(practice.id, {
            practiceId: practice.id,
            attemptsMade: 0,
            attemptsRequired: practice.attemptsRequired,
            completed: false
          });
        }
      }
      
      if (signal?.aborted) return;
      setPractices(updatedPractices);
      setProgressMap(newProgressMap);
      setCacheTimestamp(now);
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && (error.name === 'AbortError' || error.message === 'Failed to fetch'))) {
        return;
      }
      console.error('Error loading practice progress:', error);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [cacheTimestamp, progressMap.size]);

  const updatePracticeProgress = useCallback((practiceId: string, progress: PracticeProgress) => {
    setProgressMap(prev => {
      const newMap = new Map(prev);
      newMap.set(practiceId, progress);
      return newMap;
    });
    
    setPractices(prev => prev.map(p => {
      if (p.id === practiceId) {
        return {
          ...p,
          attemptsMade: progress.attemptsMade,
          completed: progress.completed
        };
      }
      return p;
    }));
    
    setCacheTimestamp(Date.now());
  }, []);

  const invalidateCache = useCallback(() => {
    setCacheTimestamp(0);
    setProgressMap(new Map());
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProgress(false, controller.signal);
    return () => controller.abort();
  }, [loadProgress]);

  return (
    <PracticeContext.Provider value={{
      practices,
      progressMap,
      isLoading,
      loadProgress,
      updatePracticeProgress,
      invalidateCache
    }}>
      {children}
    </PracticeContext.Provider>
  );
}

export function usePractice() {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
}
