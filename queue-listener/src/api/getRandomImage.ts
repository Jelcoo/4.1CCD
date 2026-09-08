import type { UnsplashPhoto } from '@/types/unsplash.ts';

const UNSPLASH_URL = 'https://api.unsplash.com/photos/random?orientation=landscape';

export async function getRandomImage(): Promise<UnsplashPhoto> {
  const res = await fetch(UNSPLASH_URL, {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Unsplash request failed: ${res.status} ${res.statusText} (${body})`);
  }

  return res.json();
}
