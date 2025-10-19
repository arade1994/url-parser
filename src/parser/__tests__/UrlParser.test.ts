import { describe, test, expect } from 'vitest';
import UrlParser from '../UrlParser';

describe('UrlParser', () => {
  test('extracts URLs from brackets', () => {
    const parser = new UrlParser();
    const result = parser.extractUrls('hello [ www.google.com ]');
    expect(result).toEqual(['www.google.com']);
  });

  test('ignores escaped brackets', () => {
    const parser = new UrlParser();
    const result = parser.extractUrls('\\[ www.google.com ]');
    expect(result).toEqual([]);
  });

  test('handles nested brackets', () => {
    const parser = new UrlParser();
    const result = parser.extractUrls('[ [www.a.com] www.b.com ]');
    expect(result).toEqual(['www.b.com']);
  });

  test('extracts only last URL in a pair', () => {
    const parser = new UrlParser();
    const result = parser.extractUrls('[ www.a.com www.b.com ]');
    expect(result).toEqual(['www.b.com']);
  });

  test('ignores URLs in code blocks', () => {
    const parser = new UrlParser();
    const result = parser.extractUrls('`www.a.com`');
    expect(result).toEqual([]);
  });
});
