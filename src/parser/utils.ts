const URL_REGEX = /(https?:\/\/[^\s\]]+|www\.[^\s\]]+)/gi;

//**
/**
 * Extract the last URL from a text
 * @param text - The text to extract the last URL from
 * @returns The last URL in the text, or null if no URL is found
 */
export function extractLastUrlFromText(text: string): string | null {
  let lastUrl: string | null = null;
  let matchedUrls: RegExpExecArray | null = null;
  while ((matchedUrls = URL_REGEX.exec(text)) !== null) lastUrl = matchedUrls[0];

  return lastUrl;
}
