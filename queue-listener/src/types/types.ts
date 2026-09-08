import { StationMeasurement } from '@/types/buienradar';

export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

export interface JobRecord {
  id: string;
  status: JobStatus;
  expectedStationCount: number;
  createdAt: string;
  resultUrls?: string[];
  error?: string;
}

export interface QueuedImageJob extends StationMeasurement {
  jobId: string;
}
