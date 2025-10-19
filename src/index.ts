import 'dotenv/config';
import path from 'path';
import Runner from './runner/Runner';
import FetchJobQueue from './job-queue/FetchJobQueue';
import UrlParser from './parser/UrlParser';
import UrlProcessor from './url-processor/UrlProcessor';
import { logger } from './runner/logger';

export async function cli() {
  const secret = process.env.SECRET;
  if (!secret) {
    logger.fatal('SECRET is not set');
    process.exit(1);
  }

  const parser = new UrlParser();
  const processor = new UrlProcessor(secret);
  const queue = new FetchJobQueue(parser, processor);
  const runner = new Runner(queue);

  const [, , relativePath] = process.argv;

  if (relativePath) {
    const absolutePath = path.resolve(process.cwd(), relativePath);
    await runner.fromFile(absolutePath);
  } else {
    await runner.fromStdin();
  }

  process.exit(0);
}

cli().catch((err) => {
  process.stderr.write(`[FATAL] ${err.message}\n`);
  process.exit(1);
});
