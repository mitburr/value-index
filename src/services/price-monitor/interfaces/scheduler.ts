type JobStatus = 'idle' | 'running' | 'failed';
type JobType = 'price_tracking' | 'product_validation';  // Enumerate known job types

interface ScheduledJob {
  id: string;
  jobType: JobType;  // Now restricted to known types
  lastRun: Date | null;
  nextRun: Date | null;
  status: JobStatus;
  retryCount: number;
  metadata: JobMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// Type-safe metadata with generic constraint
interface JobMetadata {
  lastError?: string;
  productIds?: string[];
  runDuration?: number;
}