import type UrlParser from './parser';
import type UrlProcessor from './url-processor';

interface Job {
  url: string;
  attempt: number;
}

export default class FetchJobQueue {
  private queue: Job[] = [];
  private seen = new Set<string>();
  private ticking = false;

  constructor(private parser: UrlParser, private processor: UrlProcessor, private rateLimitMs = 1000) {}

  add(url: string) {
    if (this.seen.has(url)) return;
    this.seen.add(url);
    this.queue.push({ url, attempt: 0 });
    this.start();
  }

  start(): void {
    if (this.ticking) return;
    this.ticking = true;
    setInterval(() => this.tick(), this.rateLimitMs);
  }

  handleChunk(chunk: string | Buffer<ArrayBufferLike>): void {
    const urls = this.parser.feed(chunk.toString());
    process.stdout.write('Found URLs: ' + JSON.stringify(urls) + '\n--------------------------------\n');
    for (const u of urls) this.add(u);
  }

  async tick(): Promise<void> {
    const job = this.queue.shift();
    if (!job) return;

    try {
      process.stdout.write('Fetching URL: ' + job.url + '\n');
      const response = await this.processor.fetchAndParse(job.url);
      process.stdout.write(JSON.stringify(response) + '\n--------------------------------\n');
    } catch (err: any) {
      await this.handleFailure(job, err);
    }
  }

  async handleFailure(job: Job, err: Error): Promise<void> {
    if (job.attempt === 0) {
      process.stderr.write(`[ERROR] ${job.url} -> ${err.message}\n--------------------------------\n`);
      setTimeout(() => this.queue.push({ url: job.url, attempt: 1 }), 60_000);
    } else {
      process.stderr.write(`[ERROR] ${job.url} -> ${err.message}\n--------------------------------\n`);
    }
  }
}
