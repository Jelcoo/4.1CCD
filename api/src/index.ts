import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { healthRouter } from '@/routes/health.ts';
import { weatherRouter } from '@/routes/weather.ts';

export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use('/health', healthRouter);
app.use('/weather', weatherRouter);

app.get('/', (_req, res) => {
  res.json({ service: 'api', status: 'ok' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

const port = Number(process.env.API_PORT ?? 3000);
app.listen(port, () => {
  logger.info(`api listening on :${port}`);
});
