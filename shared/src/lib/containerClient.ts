import { BlobItem, BlobSASPermissions } from '@azure/storage-blob';
import { join } from 'pathe';
import { getContainerClient } from './azureClients';

const containerName = process.env.IMAGE_CONTAINER_NAME ?? '';

const containerClient = getContainerClient(containerName);

export async function uploadWeatherImage(jobId: string, stationId: number, data: Buffer): Promise<string> {
  const blobName = join(jobId, `${stationId}.png`);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(data, { blobHTTPHeaders: { blobContentType: 'image/png' } });

  return blockBlobClient.url;
}

export async function getWeatherImagesCount(jobId: string): Promise<number> {
  let count = 0;

  for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: `${jobId}/` })) {
    if (item.kind === 'blob') {
      count++;
    }
  }

  return count;
}

export async function getWeatherImages(jobId: string): Promise<BlobItem[]> {
  const images: BlobItem[] = [];

  for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: `${jobId}/` })) {
    if (item.kind === 'blob') {
      images.push(item);
    }
  }

  return images;
}

export async function getSasUrl(blobName: string): Promise<string> {
  return await containerClient.getBlockBlobClient(blobName).generateSasUrl({
    permissions: BlobSASPermissions.parse('r'),
    expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
  });
}
