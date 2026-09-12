import 'dotenv/config';
import * as process from 'node:process';
import { app, InvocationContext } from '@azure/functions';
import { queueMessage } from 'shared/lib/queueClient';
import { updateExpectedJobStations } from 'shared/lib/tableClient';
import { QueuedImageJob } from 'shared/types/types';
import { getWeatherData } from '@/api/getWeatherData';

const generationQueueName = process.env.GENERATION_QUEUE_NAME ?? '';
const imageQueueName = process.env.IMAGE_QUEUE_NAME ?? '';

export async function processQueueMessage(queueItem: string, context: InvocationContext): Promise<void> {
  context.log(`Processing queue message: ${queueItem}`);

  const weatherData = await getWeatherData();
  const stations = weatherData.actual.stationmeasurements;

  updateExpectedJobStations(queueItem, stations.length).then(() =>
    context.log(`Expected stations for ${queueItem} set to ${stations.length}`),
  );

  for (const station of stations) {
    context.log(`Queueing station ${station.stationid} ${station.stationname} for job ${queueItem}`);

    const message: QueuedImageJob = {
      ...station,
      jobId: queueItem,
    };

    await queueMessage(imageQueueName, JSON.stringify(message));
  }
}

app.storageQueue('processGenerationQueueMessage', {
  queueName: generationQueueName,
  connection: 'AzureWebJobsStorage',
  handler: processQueueMessage,
});
