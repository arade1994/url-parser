import * as crypto from 'node:crypto';
import type { IUrlInfo } from './types';

/**
 * Formats the URL to be a valid URL
 * @param url - The URL to format
 * @returns The formatted URL
 */
export function formatUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * Fetches the body with a GET request to the URL
 * @param url - The URL to fetch the body of
 * @returns The body of the URL as a string
 */
export async function fetchUrlBody(url: string): Promise<string> {
  let response;
  try {
    response = await fetch(url);
  } catch (error: any) {
    throw new Error(`Network error: ${error.message}`);
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.text();
}

/**
 * Extracts the title and email from the HTML
 * @param url - The URL to extract the title and email from
 * @param html - The HTML of the URL
 * @returns The parsed URL info
 */
export function extractUrlTitleAndEmail(url: string, html: string): IUrlInfo {
  const info: IUrlInfo = { url };
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim();
  if (title) info.title = title;

  const emailMatch = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.exec(html)?.[0];
  if (emailMatch) info.email = emailMatch;

  return info;
}

/**
 * Hashes the email
 * @param email - The email to hash
 * @param secret - The secret to use for the hash
 * @returns The hashed email
 */
export function hashEmail(email: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(email, 'utf8').digest('hex');
}
