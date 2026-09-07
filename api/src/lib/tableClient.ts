import { logger } from '@/index.ts';
import { getTableClient } from '@/lib/azureClients.ts';
import { JobRecord } from '@/lib/types.ts';

const tableName = process.env.WEATHER_TABLE_NAME ?? '';
const partitionKey = 'job';

const tableClient = getTableClient(tableName);

export async function getJobRecord(id: string): Promise<JobRecord | null> {
  try {
    return await tableClient.getEntity<JobRecord>(partitionKey, id);
  } catch (error) {
    logger.error(error);

    return null;
  }
}
