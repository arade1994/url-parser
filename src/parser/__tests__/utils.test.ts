import { describe, test, expect } from 'vitest';
import { extractLastUrlFromText } from '../utils';

describe('extractLastUrlFromText()', () => {
  test('returns null if no URLs are found', () => {
    const text = 'Hello';
    const result = extractLastUrlFromText(text);
    expect(result).toEqual(null);
  });

  test('extracts the last URL from a text with multiple URLs', () => {
    const text = 'Hello [https://example.com] [https://example.com/2]';
    const result = extractLastUrlFromText(text);
    expect(result).toEqual('https://example.com/2');
  });

  test('extracts the last URL from a text with multiple URLs', () => {
    const text = 'Hello [https://example.com] [https://example.com/2] [https://example.com/3]';
    const result = extractLastUrlFromText(text);
    expect(result).toEqual('https://example.com/3');
  });
});
