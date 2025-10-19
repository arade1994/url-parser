import FetchJobQueue from '../FetchJobQueue';

class MockParser {
  extractUrls = vi.fn(() => ['www.mock.com']);
}

class MockProcessor {
  fetchAndParseUrl = vi.fn(async (url: string) => ({ url, title: 'Mock' }));
}

describe('FetchJobQueue', () => {
  test('adds and processes URLs', async () => {
    const parser = new MockParser();
    const processor = new MockProcessor();
    const queue = new FetchJobQueue(parser, processor);

    queue.handleChunk('[ www.mock.com ]');
    await queue.handleProcessed();

    expect(processor.fetchAndParseUrl).toHaveBeenCalledWith('www.mock.com');
  });

  test('handles processed when no URLs are added', async () => {
    const parser = new MockParser();
    const processor = new MockProcessor();
    const queue = new FetchJobQueue(parser, processor);

    await queue.handleProcessed();
  });
});
