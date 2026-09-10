import { TableEntity } from '@azure/data-tables';
import { JobRecord } from '../types/types';
import { getTableClient } from './azureClients';

const tableName = process.env.WEATHER_TABLE_NAME ?? '';
const partitionKey = 'job';

const tableClient = getTableClient(tableName);

export async function createJobRecord(id: string, expectedStationCount: number): Promise<void> {
  const record: TableEntity<JobRecord> = {
    partitionKey,
    rowKey: id,
    id,
    status: 'Queued',
    expectedStationCount,
    createdAt: new Date().toISOString(),
  };

  await tableClient.createEntity(record);
}

export async function getJobRecord(id: string): Promise<JobRecord | null> {
  try {
    return await tableClient.getEntity<JobRecord>(partitionKey, id);
  } catch (_err) {
    return null;
  }
}

export async function markJobRunning(id: string): Promise<void> {
  await tableClient.updateEntity(
    {
      partitionKey,
      rowKey: id,
      status: 'Running',
    },
    'Merge',
  );
}

export async function markJobCompleted(id: string): Promise<void> {
  await tableClient.updateEntity(
    {
      partitionKey,
      rowKey: id,
      status: 'Completed',
    },
    'Merge',
  );
}
