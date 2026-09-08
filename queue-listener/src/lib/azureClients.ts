import { TableClient } from '@azure/data-tables';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
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

export function getBlobClient(): BlobServiceClient {
  return new BlobServiceClient(connectionString);
}

export function getContainerClient(containerName: string): ContainerClient {
  const blobServiceClient = getBlobClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  containerClient.createIfNotExists();

  return containerClient;
}
