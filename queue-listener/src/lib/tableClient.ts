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
