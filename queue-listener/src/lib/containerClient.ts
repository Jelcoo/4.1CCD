import { join } from 'pathe';
import { getContainerClient } from '@/lib/azureClients';

const containerName = process.env.IMAGE_CONTAINER_NAME ?? '';

const containerClient = getContainerClient(containerName);

export async function uploadWeatherImage(jobId: string, stationId: number, data: Buffer): Promise<string> {
  const blobName = join(jobId, `${stationId}.png`);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(data, { blobHTTPHeaders: { blobContentType: 'image/png' } });

  return blockBlobClient.url;
}

export async function getWeatherImages(jobId: string): Promise<string[]> {
  const blobs = containerClient.listBlobsByHierarchy('/', { prefix: jobId });
  const blobUrls = [];

  for await (const blob of blobs) {
    if (blob.kind === 'blob') {
      const url = join(jobId, blob.name);
      blobUrls.push(url);
    }
  }

  return blobUrls;
}
