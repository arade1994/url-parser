import { describe, beforeEach, test, vi, expect } from 'vitest';
import UrlProcessor from '../UrlProcessor';

describe('UrlProcessor', () => {
  const secret = 'test_secret';
  const processor = new UrlProcessor(secret);

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '<title>Example</title><p>Email: test@example.com</p>',
    });
  });

  test('fetches and parses title and email', async () => {
    const result = await processor.fetchAndParseUrl('www.test.com');
    expect(result.url).toBe('www.test.com');
    expect(result.title).toBe('Example');
    expect(result.email).toMatch(/^[a-f0-9]{64}$/);
  });

  test('throws if fetch fails', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    await expect(processor.fetchAndParseUrl('www.fail.com')).rejects.toThrow('Network error');
  });
});
