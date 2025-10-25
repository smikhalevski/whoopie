/**
 * Options of a [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) header
 * or a cookie that can be assigned to {@link document.cookie}.
 */
export interface CookieOptions {
  /**
   * Indicates the maximum lifetime of the cookie as an HTTP-date timestamp. See {@link Date} for the required
   * formatting.
   */
  expiresAt?: Date | string | number;

  /**
   * Indicates the number of _seconds_ until the cookie expires. A zero or negative number will expire the cookie
   * immediately.
   *
   * If both {@link expiresAt} and {@link maxAge} are set, {@link maxAge} has precedence.
   */
  maxAge?: number;

  /**
   * Indicates the path that must exist in the requested URL for the browser to send the `Cookie` header.
   */
  path?: string;

  /**
   * Defines the host to which the cookie will be sent.
   *
   * Only the current domain can be set as the value, or a domain of a higher order, unless it is a public suffix.
   * Setting the domain will make the cookie available to it, as well as to all its subdomains.
   *
   * If omitted, this attribute defaults to the host of the current document URL, not including subdomains.
   *
   * Leading dots in domain names (`.example.com`) are ignored.
   *
   * Multiple host/domain values are not allowed, but if a domain is specified, then subdomains are always included.
   */
  domain?: string;

  /**
   * Controls whether or not a cookie is sent with cross-site requests: that is, requests originating from
   * a different site, including the scheme, from the site that set the cookie.
   */
  sameSite?: 'strict' | 'lax' | 'none';

  /**
   * Indicates that the cookie is sent to the server only when a request is made with the `https:` scheme
   * (except on localhost).
   */
  isSecure?: boolean;

  /**
   * Forbids JavaScript from accessing the cookie, for example, through the `document.cookie` property.
   */
  isHttpOnly?: boolean;

  /**
   * Indicates that the cookie should be stored using partitioned storage. Note that if this is set to `true`,
   * {@link isSecure} must also be set to `true`. See
   * [Cookies Having Independent Partitioned State (CHIPS)](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Privacy_sandbox/Partitioned_cookies)
   * for more details.
   */
  isPartitioned?: boolean;
}

/**
 * Reads and writes cookies.
 */
export interface CookieStorage<Cookies extends Record<string, any> = Record<string, any>> {
  /**
   * Returns all cookies as name-value map.
   */
  getAll(): Partial<Cookies>;

  /**
   * Returns names of all existing cookies.
   */
  getNames(): Array<keyof Cookies>;

  /**
   * Returns a cookie value by its name.
   *
   * @param name The cookie name.
   */
  get<Name extends keyof Cookies>(name: Name): Cookies[Name] | undefined;

  /**
   * Sets a cookie value by its name.
   *
   * @param name The cookie name.
   * @param value The cookie value.
   * @param options Additional cookie options.
   */
  set<Name extends keyof Cookies>(name: Name, value: Cookies[Name], options?: CookieOptions): void;

  /**
   * Returns `true` is a cookie with a given name exists.
   *
   * @param name The cookie name.
   */
  has(name: keyof Cookies): boolean;

  /**
   * Deletes cookie by its name.
   *
   * @param name The cookie name.
   */
  delete(name: keyof Cookies): void;

  /**
   * Deletes all cookies.
   */
  clear(): void;

  /**
   * Iterates over existing cookies.
   */
  [Symbol.iterator](): Iterator<[string, any]>;
}

/**
 * Parses and serializes values.
 */
export interface Serializer<T = any> {
  /**
   * Parses serialized value.
   *
   * @param text The serialized value.
   */
  parse(text: string): T;

  /**
   * Serializes value as a string.
   *
   * @param value The value to serialize.
   */
  stringify(value: T): string;
}

/**
 * Options of {@link createCookieStorage}.
 */
export interface CookieStorageOptions {
  /**
   * Returns cookies.
   *
   * @example
   * () => document.cookie
   */
  getCookie: () => readonly string[] | string | null | undefined;

  /**
   * Sets a new cookie.
   *
   * @example
   * cookie => document.cookie = cookie
   */
  setCookie: (cookie: string) => void;

  /**
   * Parses and serializes cookie values.
   */
  serializer?: Serializer;
}
