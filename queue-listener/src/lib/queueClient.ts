import { QueueSendMessageResponse } from '@azure/storage-queue';
import { getQueueClient } from '@/lib/azureClients';

const queueName = process.env.IMAGE_QUEUE_NAME ?? '';

const queueClient = getQueueClient(queueName);

export function queueMessage(message: string): Promise<QueueSendMessageResponse> {
  return queueClient.sendMessage(Buffer.from(message).toString('base64'));
}
