import { TableEntity } from '@azure/data-tables';
import { getTableClient } from '@/lib/azureClients';
import { JobRecord } from '@/types/types';

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
    // Table Storage can't hold arrays, so resultUrls is persisted as a JSON string.
    const entity = await tableClient.getEntity<Omit<JobRecord, 'resultUrls'> & { resultUrls?: string }>(
      partitionKey,
      id,
    );

    return {
      ...entity,
      resultUrls: entity.resultUrls ? (JSON.parse(entity.resultUrls) as string[]) : undefined,
    };
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

export async function markJobCompleted(id: string, resultUrls: string[]): Promise<void> {
  await tableClient.updateEntity(
    {
      partitionKey,
      rowKey: id,
      status: 'Completed',
      resultUrls: JSON.stringify(resultUrls),
    },
    'Merge',
  );
}
