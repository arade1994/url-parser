import type { IUrlParser } from '../parser/types';
import type UrlParser from '../parser/UrlParser';
import type { IUrlProcessor } from '../url-processor/types';
import type UrlProcessor from '../url-processor/UrlProcessor';
import type { IFetchJobQueue, IJob } from './types';

/**
 * Queue for fetching URLs
 * @description Fetches URLs from a chunk of text, extracting URLs and adding them to the queue
 */
export default class FetchJobQueue implements IFetchJobQueue {
  /**
   * The queue of jobs to process
   */
  private queue: IJob[] = [];
  /**
   * The set of URLs that have been processed
   */
  private processedUrls = new Set<string>();
  /**
   * Whether the job processing is ticking
   */
  private ticking = false;
  /**
   * The interval for processing jobs
   */
  private interval: NodeJS.Timeout | undefined;
  /**
   * The number of active jobs
   */
  private activeJobs = 0;
  /**
   * Whether the job processing is stopped
   */
  private stopped = false;

  constructor(
    private readonly parser: IUrlParser,
    private readonly processor: IUrlProcessor,
    /**
     * The rate limit for processing jobs
     */
    private readonly rateLimitMs = 1000,
  ) {}

  /**
   * Handles a chunk of text, extracting URLs and adding them to the queue
   * @param chunk - The chunk of text to handle
   * @example
   * const queue = new FetchJobQueue(parser, processor);
   * queue.handleChunk('[https://example.com]');
   * console.log(queue.queue); // [{ url: 'https://example.com', attempt: 0 }]
   */
  handleChunk(chunk: string | Buffer<ArrayBufferLike>): void {
    const urls = this.parser.extractUrls(chunk.toString());
    for (const url of urls) this.addUrl(url);
  }

  /**
   * Waits for all jobs to be done
   * @returns A promise that resolves when all jobs are done
   * @example
   * const queue = new FetchJobQueue(parser, processor);
   * queue.handleChunk('[https://example.com]');
   * await queue.handleProcessed();
   * console.log(queue.queue); // []
   */
  async handleProcessed(): Promise<void> {
    if (this.queue.length === 0 && this.activeJobs === 0) {
      this.stopJobProcessing();
      return;
    }

    await new Promise<void>((resolve) => {
      const check = () => {
        if (this.queue.length === 0 && this.activeJobs === 0) {
          this.stopJobProcessing();
          resolve();
        } else {
          setTimeout(check, 250);
        }
      };
      check();
    });
  }

  /**
   * Adds a URL to the queue if it hasn't been seen yet
   * @param url - The URL to add
   */
  private addUrl(url: string) {
    if (this.processedUrls.has(url)) return;
    this.processedUrls.add(url);
    this.queue.push({ url, attempt: 0 });
    this.startJobProcessing();
  }

  /**
   * Starts the job processing
   * @description Starts the interval for processing jobs
   */
  private startJobProcessing() {
    if (this.ticking || this.stopped) return;
    this.ticking = true;
    this.interval = setInterval(() => this.processJob(), this.rateLimitMs);
  }

  /**
   * Processes a job
   * @description Processes a job from the queue
   * @returns A promise that resolves when the job is processed
   */
  private async processJob(): Promise<void> {
    const job = this.queue.shift();
    if (!job) {
      if (this.activeJobs === 0) this.stopJobProcessing();
      return;
    }

    this.activeJobs++;

    try {
      const result = await this.processor.fetchAndParseUrl(job.url);
      process.stdout.write(JSON.stringify(result) + '\n');
    } catch (err: any) {
      await this.handleFailure(job, err);
    } finally {
      this.activeJobs--;
      if (this.queue.length === 0 && this.activeJobs === 0) this.stopJobProcessing();
    }
  }

  /**
   * Handles a request failure
   * @description Handles a failure by retrying the job after a delay
   * @param job - The job that failed
   * @param err - The error that occurred
   */
  private async handleFailure(job: IJob, err: Error) {
    process.stderr.write(`[ERROR] ${job.url} -> ${err.message}\n`);
    if (job.attempt === 0) {
      setTimeout(() => {
        this.queue.push({ url: job.url, attempt: 1 });
        this.startJobProcessing();
      }, 60_000);
    }
  }

  /**
   * Stops the job processing
   * @description Stops the interval for processing jobs
   */
  private stopJobProcessing() {
    if (this.interval) clearInterval(this.interval);
    this.interval = undefined;
    this.ticking = false;
    this.stopped = true;
  }
}
