import { BlobItem, BlobSASPermissions } from '@azure/storage-blob';
import { getContainerClient } from '@/lib/azureClients.ts';

const containerName = process.env.IMAGE_CONTAINER_NAME ?? '';

const containerClient = getContainerClient(containerName);

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
