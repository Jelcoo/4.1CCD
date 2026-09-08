import 'dotenv/config';
import * as process from 'node:process';
import { app, InvocationContext } from '@azure/functions';
import { getWeatherImages } from '@/lib/containerClient';
import { getJobRecord, markJobCompleted } from '@/lib/tableClient';

const postprocessImageQueueName = process.env.POSTPROCESS_IMAGE_QUEUE_NAME ?? '';

export async function processQueueMessage(queueItem: string, context: InvocationContext): Promise<void> {
  context.log(`Starting post processing for ${queueItem})`);

  const jobRecord = await getJobRecord(queueItem);
  if (!jobRecord) {
    context.log(`Job record not found for ${queueItem}`);
    return;
  }

  const imageUrls = await getWeatherImages(jobRecord.id);

  if (imageUrls.length <= jobRecord.expectedStationCount) {
    return;
  }

  await markJobCompleted(jobRecord.id, imageUrls);
}

app.storageQueue('processPostprocessImageQueueMessages', {
  queueName: postprocessImageQueueName,
  connection: 'AzureWebJobsStorage',
  handler: processQueueMessage,
});
