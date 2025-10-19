import fs from 'fs';
import FetchJobQueue from '../job-queue/FetchJobQueue';
import type { IRunner } from './types';

export default class Runner implements IRunner {
  constructor(private readonly queue: FetchJobQueue) {}

  /**
   * Process URLs from a given file
   * @param absolutePath - The absolute path to the file
   * @returns A promise that resolves when the file is processed
   * @example
   * await runner.fromFile('path/to/file.txt');
   */
  async fromFile(absolutePath: string): Promise<void> {
    const stream = fs.createReadStream(absolutePath, { encoding: 'utf8' });

    stream.on('data', (chunk: string | Buffer<ArrayBufferLike>) => this.queue.handleChunk(chunk));
    stream.on('error', (error: Error) => process.stderr.write(`[ERROR] Failed to read file: ${error.message}\n`));

    return new Promise((resolve) => {
      stream.on('end', async () => {
        await this.queue.handleProcessed();
        process.stdout.write('✅ All done, exiting.\n');
        resolve();
      });
    });
  }

  /**
   * Process URLs from stdin (interactive or piped)
   * @returns A promise that resolves when the stdin is processed
   * @example
   * await runner.fromStdin();
   * // or
   * echo "https://example.com" | node index.js
   */
  async fromStdin(): Promise<void> {
    process.stdin.setEncoding('utf8');
    const isInteractive = process.stdin.isTTY;

    if (isInteractive) {
      process.stdout.write('🟢 Enter text and press Enter to run:\n');
    }

    return new Promise((resolve) => {
      process.stdin.on('data', async (chunk: string | Buffer<ArrayBufferLike>) => {
        const text = chunk.toString().trim();
        if (!text) return;
        this.queue.handleChunk(text);
        await this.queue.handleProcessed();
        process.stdout.write('✅ Done, exiting.\n');
        resolve();
      });

      process.stdin.on('end', async () => {
        await this.queue.handleProcessed();
        process.stdout.write('✅ Done, exiting.\n');
        resolve();
      });
    });
  }
}
