import type { IUrlProcessor, IUrlInfo } from './types';
import { extractUrlTitleAndEmail, fetchUrlBody, formatUrl, hashEmail } from './utils';

/**
 * Processor for URLs
 * @description Fetches and parses the URL, extracting the title and email
 */
export default class UrlProcessor implements IUrlProcessor {
  constructor(private readonly secret: string) {}

  /**
   * Fetches and parses the URL, extracting the title and email
   * @param url - The URL to fetch and parse
   * @returns The parsed URL info
   * @example
   * const processor = new UrlProcessor();
   * const urlInfo = await processor.fetchAndParse('https://example.com');
   * console.log(urlInfo); // { url: 'https://example.com', title: 'Example Domain', email: 'example@example.com' }
   */
  async fetchAndParseUrl(url: string): Promise<IUrlInfo> {
    const formattedUrl = formatUrl(url);
    const body = await fetchUrlBody(formattedUrl);
    return this.extractUrlInfo(url, body);
  }

  /**
   * Extracts the URL info from the HTML
   * @param url - The URL to extract the title and email from
   * @param html - The HTML of the URL
   * @returns The parsed URL info
   */
  private extractUrlInfo(url: string, html: string): IUrlInfo {
    const info = extractUrlTitleAndEmail(url, html);
    if (info.email) info.email = hashEmail(info.email, this.secret);
    return info;
  }
}
