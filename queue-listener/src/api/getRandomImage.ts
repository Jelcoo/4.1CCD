import type { UnsplashPhoto } from '@/types/unsplash.ts';

const UNSPLASH_URL = 'https://api.unsplash.com/photos/random?orientation=landscape';

export function getRandomImage(): Promise<UnsplashPhoto> {
  return fetch(UNSPLASH_URL, {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    },
  }).then((res) => res.json());
}
