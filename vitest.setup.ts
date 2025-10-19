import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('fail')) {
        return { ok: false, status: 500, text: async () => 'Error' };
      }
      return {
        ok: true,
        status: 200,
        text: async () => `<html><title>Mock Page</title><body><p>Email: mock@example.com</p></body></html>`,
      };
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});
