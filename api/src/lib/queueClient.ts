import { QueueSendMessageResponse } from '@azure/storage-queue';
import { getQueueClient } from '@/lib/azureClients.ts';

const queueName = process.env.GENERATION_QUEUE_NAME ?? '';

const queueClient = getQueueClient(queueName);

export function queueMessage(message: string): Promise<QueueSendMessageResponse> {
  return queueClient.sendMessage(message);
}
