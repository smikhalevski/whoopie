import { CookieOptions } from './types.js';

/**
 * Parses cookie string as a name-value record.
 *
 * @param cookie The [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cookie) header value
 * or {@link document.cookie}.
 * @group Utils
 */
export function parseCookies(cookie: readonly string[] | string | null | undefined): Record<string, string> {
  if (cookie === '' || cookie === null || cookie === undefined) {
    return {};
  }

  if (Array.isArray(cookie)) {
    if (cookie.length === 0) {
      return {};
    }

    cookie = cookie.length === 1 ? cookie[0] : cookie.join(';');
  }

  const record: Record<string, string> = {};

  for (let startIndex = 0, endIndex; startIndex < cookie.length; startIndex = endIndex + 1) {
    endIndex = cookie.indexOf(';', startIndex);

    if (endIndex === -1) {
      endIndex = cookie.length;
    }

    const valueIndex = cookie.indexOf('=', startIndex);

    if (valueIndex === -1 || valueIndex > endIndex) {
      continue;
    }

    record[decodeCookieComponent(cookie.substring(startIndex, valueIndex).trim())] = decodeCookieComponent(
      cookie.substring(valueIndex + 1, endIndex).trim()
    );
  }

  return record;
}

/**
 * Returns the array of unique cookie names.
 *
 * @param cookie The [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cookie) header value
 * or {@link document.cookie}.
 * @group Utils
 */
export function getCookieNames(cookie: readonly string[] | string | null | undefined): string[] {
  if (cookie === '' || cookie === null || cookie === undefined) {
    return [];
  }

  if (Array.isArray(cookie)) {
    if (cookie.length === 0) {
      return [];
    }

    cookie = cookie.length === 1 ? cookie[0] : cookie.join(';');
  }

  const names = [];

  for (let startIndex = 0, endIndex; startIndex < cookie.length; startIndex = endIndex + 1) {
    endIndex = cookie.indexOf(';', startIndex);

    if (endIndex === -1) {
      endIndex = cookie.length;
    }

    const valueIndex = cookie.indexOf('=', startIndex);

    if (valueIndex === -1 || valueIndex > endIndex) {
      continue;
    }

    const name = decodeCookieComponent(cookie.substring(startIndex, valueIndex).trim());

    if (names.indexOf(name) === -1) {
      names.push(name);
    }
  }

  return names;
}

/**
 * Returns the value of a cookie with the given name.
 *
 * @param cookie The [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cookie) header value
 * or {@link document.cookie}.
 * @param name The name of a cookie to retrieve.
 * @returns A cookie value or `undefined` if there's no cookie with the given name.
 * @group Utils
 */
export function getCookieValue(
  cookie: readonly string[] | string | null | undefined,
  name: string
): string | undefined {
  if (cookie === '' || cookie === null || cookie === undefined) {
    return;
  }

  if (Array.isArray(cookie)) {
    if (cookie.length === 0) {
      return;
    }

    cookie = cookie.length === 1 ? cookie[0] : cookie.join(';');
  }

  name = encodeCookieComponent(name);

  nextCookie: for (let startIndex = 0, endIndex; startIndex < cookie.length; startIndex = endIndex + 1) {
    endIndex = cookie.indexOf(';', startIndex);

    if (endIndex === -1) {
      endIndex = cookie.length;
    }

    const valueIndex = cookie.indexOf('=', startIndex);

    if (valueIndex === -1 || valueIndex > endIndex) {
      continue;
    }

    // Compare the current cookie name and the requested name
    for (let i = startIndex, j = 0; i < valueIndex; ++i) {
      const charCode = cookie.charCodeAt(i);

      if ((j === 0 || j === name.length) && isSpaceChar(charCode)) {
        continue;
      }

      if (j === name.length || charCode !== name.charCodeAt(j++)) {
        continue nextCookie;
      }
    }

    return decodeCookieComponent(cookie.substring(valueIndex + 1, endIndex).trim());
  }
}

/**
 * Stringifies cookie and corresponding options.
 *
 * @param name The name of a cookie.
 * @param value The cookie value
 * @param options Additional cookie options.
 * @returns [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) header value.
 * @group Utils
 */
export function stringifyCookie(name: string, value: string, options?: CookieOptions): string {
  let cookie = encodeCookieComponent(name) + '=' + encodeCookieComponent(value);

  if (options === undefined) {
    return cookie;
  }

  const { expiresAt, maxAge, path, domain, sameSite, isSecure, isHttpOnly, isPartitioned } = options;

  if (expiresAt !== undefined) {
    const date = new Date(expiresAt);

    if (+date === +date) {
      cookie += '; Expires=' + date.toUTCString();
    }
  }

  if (maxAge !== undefined && +maxAge === +maxAge) {
    cookie += '; Max-Age=' + (maxAge | 0);
  }

  if (path !== undefined) {
    cookie += '; Path=' + path;
  }

  if (domain !== undefined) {
    cookie += '; Domain=' + domain;
  }

  if (sameSite !== undefined) {
    cookie += '; SameSite=' + sameSite;
  }

  if (isSecure) {
    cookie += '; Secure';
  }

  if (isHttpOnly) {
    cookie += '; HttpOnly';
  }

  if (isPartitioned) {
    cookie += '; Partitioned';
  }

  return cookie;
}

/**
 * Returns the value of a cookie that was signed with a secret.
 *
 * @param cookie The [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cookie) header value
 * or {@link document.cookie}.
 * @param name The name of a cookie to retrieve.
 * @param secret The signing secret key.
 * @returns The cookie value, or `undefined` if there's no cookie with the given name or signature verification has failed.
 * @group Utils
 */
export async function getSignedCookieValue(
  cookie: readonly string[] | string | null | undefined,
  name: string,
  secret: BufferSource | string
): Promise<string | undefined> {
  const signedValue = getCookieValue(cookie, name);

  if (signedValue === undefined) {
    return;
  }

  const signatureIndex = signedValue.lastIndexOf(SIGNATURE_SEPARATOR);

  if (signatureIndex === -1) {
    return;
  }

  const value = signedValue.substring(0, signatureIndex);
  const signatureBase64 = signedValue.substring(signatureIndex + 1);

  if (await verify(value, secret, signatureBase64)) {
    return value;
  }
}

/**
 * Signs and stringifies cookie and corresponding options.
 *
 * @param name The name of a cookie.
 * @param value The cookie value
 * @param secret The signing secret key.
 * @param options Additional cookie options.
 * @returns [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) header value.
 * @group Utils
 */
export async function stringifySignedCookie(
  name: string,
  value: string,
  secret: BufferSource | string,
  options?: CookieOptions
): Promise<string> {
  const signatureBase64 = await sign(value, secret);

  return stringifyCookie(name, value + SIGNATURE_SEPARATOR + signatureBase64, options);
}

function isSpaceChar(charCode: number): boolean {
  return charCode == /* \s */ 32 || charCode === /* \n */ 10 || charCode === /* \t */ 9 || charCode === /* \r */ 13;
}

function encodeCookieComponent(str: string): string {
  return str.replace(/[;%]/g, encodeURIComponent);
}

function decodeCookieComponent(str: string): string {
  return str.replace(/%3B|%25/g, decodeURIComponent);
}

const SIGNATURE_SEPARATOR = '.';
const ALGORITHM = 'HMAC';

const textEncoder = new TextEncoder();

function toCryptoKey(secret: BufferSource | string): Promise<CryptoKey> {
  const keyData = typeof secret === 'string' ? textEncoder.encode(secret) : secret;

  return crypto.subtle.importKey('raw', keyData, { name: ALGORITHM, hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/**
 * Returns the Base64 signature of the value.
 */
async function sign(value: string, secret: BufferSource | string): Promise<string> {
  const signature = await crypto.subtle.sign(ALGORITHM, await toCryptoKey(secret), textEncoder.encode(value));

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Verifies that the signature matches the value and the secret.
 */
async function verify(value: string, secret: BufferSource | string, signatureBase64: string): Promise<boolean> {
  try {
    const signature = atob(signatureBase64);

    const signatureBytes = new Uint8Array(signature.length);

    for (let i = 0; i < signature.length; ++i) {
      signatureBytes[i] = signature.charCodeAt(i);
    }

    return crypto.subtle.verify(ALGORITHM, await toCryptoKey(secret), signatureBytes, textEncoder.encode(value));
  } catch {
    return false;
  }
}
