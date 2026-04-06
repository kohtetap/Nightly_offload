export interface OffloadEntry {
  id: string;
  timestamp: number;
  thought: string;
  tags: string[];
  stressLevel: number; // 1-10
}

export type Step = 'name' | 'park' | 'breathe' | 'complete' | 'history' | 'morning';
