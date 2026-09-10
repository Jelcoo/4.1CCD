import { Router } from 'express';
import { v7 as uuidv7 } from 'uuid';
import { getSasUrl, getWeatherImages } from '@/lib/containerClient.ts';
import { queueMessage } from '@/lib/queueClient.ts';
import { getJobRecord } from '@/lib/tableClient.ts';

export const weatherRouter = Router();

weatherRouter.get('/generate', async (_req, res) => {
  const jobId = uuidv7();
  await queueMessage(jobId);

  res.status(200).json({ status: 'success', jobId: jobId });
});

weatherRouter.get('/status/:id', async (req, res) => {
  const job = await getJobRecord(req.params.id);

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.status(200).json(job);
});

weatherRouter.get('/images/:id', async (req, res) => {
  const job = await getJobRecord(req.params.id);

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  const images = await getWeatherImages(job.id);
  const imageUrls = images.map((image) => image.name);
  const imageSasUrls = await Promise.all(imageUrls.map(getSasUrl));

  res.status(200).json(imageSasUrls);
});
