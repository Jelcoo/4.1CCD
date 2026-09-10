export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

export interface JobRecord {
  id: string;
  status: JobStatus;
  expectedStationCount: number;
  createdAt: string;
  error?: string;
}
