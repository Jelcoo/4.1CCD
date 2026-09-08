const IMAGE_URL = 'https://picsum.photos/1080/720';

export async function getRandomImage(): Promise<Buffer> {
  const res = await fetch(IMAGE_URL);

  return Buffer.from(await res.arrayBuffer());
}
