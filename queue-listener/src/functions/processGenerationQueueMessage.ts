import 'dotenv/config';
import * as process from 'node:process';
import { app, InvocationContext } from '@azure/functions';
import { getWeatherData } from '@/api/getWeatherData';
import { queueMessage } from '@/lib/queueClient';
import { createJobRecord } from '@/lib/tableClient';
import { QueuedImageJob } from '@/types/types';

const queueName = process.env.GENERATION_QUEUE_NAME ?? '';

export async function processQueueMessage(queueItem: string, context: InvocationContext): Promise<void> {
  context.log(`Processing queue message: ${queueItem}`);

  const weatherData = await getWeatherData();
  const stations = weatherData.actual.stationmeasurements;

  createJobRecord(queueItem, stations.length).then(() => context.log(`Job record created for ${queueItem}`));

  for (const station of stations) {
    context.log(`Queueing station ${station.stationid} ${station.stationname} for job ${queueItem}`);

    const message: QueuedImageJob = {
      ...station,
      jobId: queueItem,
    };

    await queueMessage(JSON.stringify(message));
  }
}

app.storageQueue('processGenerationQueueMessage', {
  queueName,
  connection: 'AzureWebJobsStorage',
  handler: processQueueMessage,
});
