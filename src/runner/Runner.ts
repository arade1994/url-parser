import fs from 'fs';
import type { IRunner } from './types';
import type { IFetchJobQueue } from '../job-queue/types';
import { logger } from './logger';

export default class Runner implements IRunner {
  constructor(private readonly queue: IFetchJobQueue) {}

  /**
   * Process URLs from a given file
   * @param absolutePath - The absolute path to the file
   * @returns A promise that resolves when the file is processed
   * @example
   * await runner.fromFile('path/to/file.txt');
   */
  async fromFile(absolutePath: string): Promise<void> {
    const stream = fs.createReadStream(absolutePath, { encoding: 'utf8' });

    stream.once('data', (chunk: string | Buffer<ArrayBufferLike>) => this.queue.handleChunk(chunk));
    stream.once('error', (error: Error) => logger.error(`Failed to read file: ${error.message}`));

    return new Promise((resolve) => {
      stream.once('end', async () => {
        await this.queue.handleProcessed();
        logger.info('All done, exiting.');
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
      logger.info('Enter text and press Enter to run:');
    }

    return new Promise((resolve) => {
      process.stdin.on('data', async (chunk: string | Buffer<ArrayBufferLike>) => {
        const text = chunk.toString().trim();
        if (!text) return;
        this.queue.handleChunk(text);
        await this.queue.handleProcessed();
        logger.info('Done, exiting.');
        resolve();
      });

      process.stdin.on('end', async () => {
        await this.queue.handleProcessed();
        logger.info('Done, exiting.');
        resolve();
      });
    });
  }
}
