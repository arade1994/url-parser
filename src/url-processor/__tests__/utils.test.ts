import { formatUrl, extractUrlTitleAndEmail, hashEmail, fetchUrlBody } from '../utils';

describe('formatUrl()', () => {
  test('adds https:// if missing', () => {
    expect(formatUrl('www.google.com')).toBe('https://www.google.com');
  });

  test('keeps existing http:// prefix', () => {
    expect(formatUrl('http://example.com')).toBe('http://example.com');
  });

  test('keeps existing https:// prefix', () => {
    expect(formatUrl('https://example.com')).toBe('https://example.com');
  });
});

describe('fetchUrlBody()', () => {
  test('fetches url body', async () => {
    expect(await fetchUrlBody('https://example.com')).toMatchSnapshot();
  });
});

describe('extractUrlTitleAndEmail()', () => {
  test("doesn't extract title and email if no title or email is found", () => {
    const html = '<html><head><body><p>This is an example website.</p></body></html>';
    expect(extractUrlTitleAndEmail('https://example.com', html)).toEqual({
      url: 'https://example.com',
      title: undefined,
      email: undefined,
    });
  });

  test('extracts title with no email', () => {
    const html =
      '<html><head><title>Example Domain</title></head><body><p>This is an example website.</p></body></html>';
    expect(extractUrlTitleAndEmail('https://example.com', html)).toEqual({
      url: 'https://example.com',
      title: 'Example Domain',
      email: undefined,
    });
  });

  test('extracts email with no title', () => {
    const html = '<html><head></head><body><p>example@example.com</p></body></html>';
    expect(extractUrlTitleAndEmail('https://example.com', html)).toEqual({
      url: 'https://example.com',
      title: undefined,
      email: 'example@example.com',
    });
  });

  test('extracts title and email', () => {
    const html =
      '<html><head><title>Example Domain</title></head><body><p>This is an example website.</p><p>example@example.com</p></body></html>';
    expect(extractUrlTitleAndEmail('https://example.com', html)).toEqual({
      url: 'https://example.com',
      title: 'Example Domain',
      email: 'example@example.com',
    });
  });
});

describe('hashEmail()', () => {
  test('hashes email', () => {
    expect(hashEmail('example@example.com', 'secret')).toBe(
      '0bb2275df8909502beb1a257c30d55d734d24e1172def381244b602184816d8f',
    );
  });
});
