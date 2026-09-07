import 'dotenv/config';
import * as process from 'node:process';
import { app, InvocationContext } from '@azure/functions';

const queueName = process.env.GENERATION_QUEUE_NAME ?? '';

export async function processQueueMessage(queueItem: unknown, context: InvocationContext): Promise<void> {
  context.log(queueItem);
}

app.storageQueue('processQueueMessage', {
  queueName,
  connection: 'AzureWebJobsStorage',
  handler: processQueueMessage,
});
