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

function isSpaceChar(charCode: number): boolean {
  return charCode == /* \s */ 32 || charCode === /* \n */ 10 || charCode === /* \t */ 9 || charCode === /* \r */ 13;
}

function encodeCookieComponent(str: string): string {
  return str.replace(/[;%]/g, encodeURIComponent);
}

function decodeCookieComponent(str: string): string {
  return str.replace(/%3B|%25/g, decodeURIComponent);
}
