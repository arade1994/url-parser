import * as crypto from 'node:crypto';

export interface ParsedUrlInfo {
  url: string;
  title?: string;
  email?: string;
}

export default class UrlProcessor {
  constructor(private secret: string = '') {}

  normalizeUrl(url: string): string {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  async fetchAndParse(url: string): Promise<ParsedUrlInfo> {
    const full = this.normalizeUrl(url);
    let res;
    try {
      res = await fetch(full);
    } catch (error: any) {
      throw new Error(`Network error: ${error.message}`);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.text();
    return this.extractInfo(url, body);
  }

  extractInfo(url: string, html: string): ParsedUrlInfo {
    const out: ParsedUrlInfo = { url };
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim();
    if (title) out.title = title;

    const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.exec(html)?.[0];
    if (email) out.email = this.hashEmail(email);

    return out;
  }

  hashEmail(email: string): string {
    if (this.secret) {
      return crypto.createHmac('sha256', this.secret).update(email, 'utf8').digest('hex');
    }
    return crypto.createHash('sha256').update(email, 'utf8').digest('hex');
  }
}
