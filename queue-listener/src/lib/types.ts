export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

export interface JobRecord {
  id: string;
  status: JobStatus;
  createdAt: string;
  resultUrls?: string[];
  error?: string;
}
