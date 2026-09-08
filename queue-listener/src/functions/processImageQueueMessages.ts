import 'dotenv/config';
import * as process from 'node:process';
import { app, InvocationContext } from '@azure/functions';
import { getRandomImage } from '@/api/getRandomImage';
import { uploadWeatherImage } from '@/lib/containerClient';
import { generateWeatherImage } from '@/lib/imageGenerator';
import { queueMessage } from '@/lib/queueClient';
import { getJobRecord, markJobRunning } from '@/lib/tableClient';
import { QueuedImageJob } from '@/types/types';

const imageQueueName = process.env.IMAGE_QUEUE_NAME ?? '';
const postprocessImageQueueName = process.env.POSTPROCESS_IMAGE_QUEUE_NAME ?? '';

export async function processQueueMessage(queueItem: QueuedImageJob, context: InvocationContext): Promise<void> {
  context.log(`Starting image creation for ${queueItem.stationid} ${queueItem.stationname} (job ${queueItem.jobId})`);

  const jobRecord = await getJobRecord(queueItem.jobId);
  if (!jobRecord) {
    context.log(`Job record not found for ${queueItem}`);
    return;
  }

  if (jobRecord.status === 'Queued') {
    await markJobRunning(jobRecord.id);
  }

  const image = await getRandomImage();
  const processedImage = await generateWeatherImage(image, queueItem);

  await uploadWeatherImage(queueItem.jobId, queueItem.stationid, processedImage);

  await queueMessage(postprocessImageQueueName, queueItem.jobId);
}

app.storageQueue('processImageQueueMessages', {
  queueName: imageQueueName,
  connection: 'AzureWebJobsStorage',
  handler: processQueueMessage,
});
