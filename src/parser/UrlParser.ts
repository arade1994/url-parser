import type { IUrlParser } from './types';
import { extractLastUrlFromText } from './utils';

/**
 * Parser for URLs in text
 * @description Extracts URLs from text, handling nested brackets and escaping
 */
export default class UrlParser implements IUrlParser {
  /**
   * Whether the parser is in a bracket
   */
  private inBracket = false;
  /**
   * The depth of the bracket
   */
  private depth = 0;
  /**
   * The buffer for the current URL
   */
  private buffer = '';
  /**
   * The previous character
   */
  private prevChar: string | undefined;

  /**
   * Extract URLs from text
   * @param text - The text to extract URLs from
   * @returns An array of URLs found in the text
   * @example
   * const parser = new UrlParser();
   * const urls = parser.extractUrls('Hello [https://example.com](https://example.com)');
   * console.log(urls); // ['https://example.com']
   */
  extractUrls(text: string): string[] {
    const urls: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const prevChar = this.prevChar;
      this.prevChar = char;

      if (prevChar === '\\' && (char === '[' || char === ']')) continue;

      if (char === '[') {
        this.handleOpenBracket();
        continue;
      }

      if (char === ']') {
        const url = this.handleCloseBracket();
        if (url) urls.push(url);
        continue;
      }

      if (this.inBracket) this.buffer += char;
    }

    return urls;
  }

  /**
   * Handles opening bracket
   * @description Sets the parser to be in a bracket and increments the depth
   */
  private handleOpenBracket(): void {
    if (!this.inBracket) {
      this.inBracket = true;
      this.depth = 1;
      this.buffer = '';
    } else {
      this.depth++;
      this.buffer += '[';
    }
  }

  /**
   * Handles closing bracket
   * @description Decrements the depth and checks if the bracket is nested
   * @returns The URL found in the bracket, or null if no URL is found
   */
  private handleCloseBracket(): string | null {
    if (!this.inBracket) return null;

    this.depth--;
    if (this.depth > 0) {
      this.buffer += ']';
      return null;
    }

    const url = extractLastUrlFromText(this.buffer);
    this.inBracket = false;
    this.buffer = '';
    return url ? url.trim() : null;
  }
}
