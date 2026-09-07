import { mkdir, writeFile } from 'node:fs/promises';
import { getRandomImage } from '@/api/getRandomImage.ts';
import { getWeatherData } from '@/api/getWeatherData.ts';
import 'dotenv/config';
import { join } from 'pathe';
import { v7 as uuidv7 } from 'uuid';
import { generateWeatherImage } from '@/image-generator.ts';

const ASSETS_DIR = 'assets';

async function app(): Promise<void> {
  const data = await getWeatherData();
  const dataDir = join(ASSETS_DIR, uuidv7());

  await mkdir(dataDir, { recursive: true });

  for (const station of data.actual.stationmeasurements) {
    const image = await getRandomImage();
    const buffer = await generateWeatherImage(image.urls.regular, station);

    await writeFile(`${dataDir}/${station.stationid}.png`, buffer);
  }
}

app();
