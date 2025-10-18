import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import UrlParser from './parser';
import UrlProcessor from './url-processor';
import FetchJobQueue from './job-queue';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function run() {
  const secret = process.env.SECRET;

  if (!secret) {
    process.stderr.write('SECRET is not set\n');
    process.exit(1);
  }

  const parser = new UrlParser();
  const processor = new UrlProcessor(secret);
  const queue = new FetchJobQueue(parser, processor);

  const [, , relativePath] = process.argv;

  if (relativePath) {
    const absolutePath = path.resolve(__dirname, relativePath);
    const stream = fs.createReadStream(absolutePath, { encoding: 'utf8' });

    stream.on('data', (chunk: string | Buffer<ArrayBufferLike>) => queue.handleChunk(chunk));
    stream.on('error', (e: any) => process.stderr.write(`[ERROR] Failed to read file: ${e.message}\n`));
  } else {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string | Buffer<ArrayBufferLike>) => queue.handleChunk(chunk));
  }
}

run();
