import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import Runner from './src/runner/Runner';
import FetchJobQueue from './src/job-queue/FetchJobQueue';
import UrlParser from './src/parser/UrlParser';
import UrlProcessor from './src/url-processor/UrlProcessor';

export async function cli() {
  const secret = process.env.SECRET;
  if (!secret) {
    process.stderr.write('SECRET is not set\n');
    process.exit(1);
  }

  const parser = new UrlParser();
  const processor = new UrlProcessor(secret);
  const queue = new FetchJobQueue(parser, processor);
  const runner = new Runner(queue);

  const [, , relativePath] = process.argv;

  if (relativePath) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const absolutePath = path.resolve(__dirname, relativePath);
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
