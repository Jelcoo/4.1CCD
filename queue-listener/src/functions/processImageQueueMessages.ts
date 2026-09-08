import 'dotenv/config';
import * as process from 'node:process';
import { app, InvocationContext } from '@azure/functions';
import { getRandomImage } from '@/api/getRandomImage';
import { uploadWeatherImage } from '@/lib/containerClient';
import { generateWeatherImage } from '@/lib/imageGenerator';
import { QueuedImageJob } from '@/types/types';

const queueName = process.env.IMAGE_QUEUE_NAME ?? '';

export async function processQueueMessage(queueItem: QueuedImageJob, context: InvocationContext): Promise<void> {
  context.log(`Starting image creation for ${queueItem.stationid} ${queueItem.stationname} (job ${queueItem.jobId})`);

  const image = await getRandomImage();
  const processedImage = await generateWeatherImage(image, queueItem);

  uploadWeatherImage(queueItem.jobId, queueItem.stationid, processedImage);
}

app.storageQueue('processImageQueueMessages', {
  queueName,
  connection: 'AzureWebJobsStorage',
  handler: processQueueMessage,
});
