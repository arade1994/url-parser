import Runner from '../Runner';

class MockQueue {
  handleChunk = vi.fn();
  handleProcessed = vi.fn().mockResolvedValue(undefined);
}

describe('Runner', () => {
  afterEach(() => {
    process.stdin.removeAllListeners('data');
    process.stdin.removeAllListeners('end');
  });

  test('calls handleChunk and handleProcessed for stdin', async () => {
    const queue = new MockQueue();
    const runner = new Runner(queue as any);

    process.stdin.isTTY = false;
    process.stdin.push('test [ www.mock.com ]');
    process.stdin.emit('end');

    await runner.fromStdin();

    expect(queue.handleChunk).toHaveBeenCalled();
    expect(queue.handleProcessed).toHaveBeenCalled();
  });

  test('calls handleChunk and handleProcessed for file', async () => {
    const queue = new MockQueue();
    const runner = new Runner(queue as any);

    await runner.fromFile('files/mock.txt');

    expect(queue.handleChunk).toHaveBeenCalled();
    expect(queue.handleProcessed).toHaveBeenCalled();
  });
});
