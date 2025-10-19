import type { ParsedUrlInfo } from '../types/ParsedUrlInfo';

export interface IUrlInfo {
  url: string;
  title?: string;
  email?: string;
}

export interface IUrlProcessor {
  fetchAndParseUrl(url: string): Promise<IUrlInfo>;
}
