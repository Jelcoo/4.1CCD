import { TableClient } from '@azure/data-tables';
import { QueueClient } from '@azure/storage-queue';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING ?? '';

export function getTableClient(tableName: string): TableClient {
  const tableClient = TableClient.fromConnectionString(connectionString, tableName, {
    allowInsecureConnection: true,
  });
  tableClient.createTable();

  return tableClient;
}

export function getQueueClient(queueName: string): QueueClient {
  const queueClient = new QueueClient(connectionString, queueName);
  queueClient.createIfNotExists();

  return queueClient;
}
