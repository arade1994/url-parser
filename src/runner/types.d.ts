export interface IRunner {
  fromFile(relativePath: string): Promise<void>;
  fromStdin(): Promise<void>;
}
