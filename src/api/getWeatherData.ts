import type { BuienradarFeed } from '@/types/buienradar.ts';

const BUIENRADAR_URL = 'https://data.buienradar.nl/2.0/feed/json';

export function getWeatherData(): Promise<BuienradarFeed> {
  return fetch(BUIENRADAR_URL).then((res) => res.json());
}
