export default class UrlParser {
  private inBracket = false;
  private depth = 0;
  private buffer = '';
  private prevChar: string | undefined;

  feed(text: string): string[] {
    const found: string[] = [];
    const len = text.length;

    for (let i = 0; i < len; i++) {
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
        if (url) found.push(url);
        continue;
      }

      if (this.inBracket) this.buffer += char;
    }

    return found;
  }

  handleOpenBracket(): void {
    if (!this.inBracket) {
      this.inBracket = true;
      this.depth = 1;
      this.buffer = '';
    } else {
      this.depth++;
      this.buffer += '[';
    }
  }

  handleCloseBracket(): string | null {
    if (!this.inBracket) return null;

    this.depth--;
    if (this.depth > 0) {
      this.buffer += ']';
      return null;
    }

    const url = this.extractLastUrl(this.buffer);
    this.inBracket = false;
    this.buffer = '';
    return url ? url.trim() : null;
  }

  extractLastUrl(text: string): string | null {
    const regex = /(https?:\/\/[^\s\]]+|www\.[^\s\]]+)/gi;
    let last: string | null = null;
    let m: RegExpExecArray | null = null;
    while ((m = regex.exec(text)) !== null) last = m[0];
    return last;
  }
}
