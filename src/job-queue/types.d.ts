export interface IJob {
  url: string;
  attempt: number;
}

export interface IFetchJobQueue {
  handleChunk(chunk: string | Buffer<ArrayBufferLike>): void;
  handleProcessed(): Promise<void>;
}
