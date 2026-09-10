import type { BuienradarFeed } from 'shared/types/buienradar';

const BUIENRADAR_URL = 'https://data.buienradar.nl/2.0/feed/json';

export function getWeatherData(): Promise<BuienradarFeed> {
  return fetch(BUIENRADAR_URL).then((res) => res.json());
}
