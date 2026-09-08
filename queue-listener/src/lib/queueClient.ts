import { QueueSendMessageResponse } from '@azure/storage-queue';
import { getQueueClient } from '@/lib/azureClients';

export function queueMessage(queueName: string, message: string): Promise<QueueSendMessageResponse> {
  const queueClient = getQueueClient(queueName);

  return queueClient.sendMessage(Buffer.from(message).toString('base64'));
}
