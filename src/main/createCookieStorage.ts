import {
  getCookieNames,
  getCookieValue,
  getSignedCookieValue,
  parseCookies,
  stringifyCookie,
  stringifySignedCookie,
} from './utils.js';
import { CookieStorage, CookieStorageOptions, Serializer } from './types.js';

/**
 * Creates a new cookie storage that uses getter and setter to access cookies.
 *
 * @param options Storage options.
 * @template Cookies Stored cookies.
 * @group Storage
 */
export function createCookieStorage<Cookies extends Record<string, any>>(
  options: CookieStorageOptions
): CookieStorage<Cookies>;

export function createCookieStorage(options: CookieStorageOptions): CookieStorage {
  const { getCookie, setCookie, serializer = defaultSerializer } = options;

  const getAll = () => {
    const record = parseCookies(getCookie());

    if (serializer === defaultSerializer) {
      return record;
    }

    for (const name in record) {
      record[name] = serializer.parse(record[name]);
    }

    return record;
  };

  return {
    getAll,

    getNames() {
      return getCookieNames(getCookie());
    },

    get(name) {
      const value = getCookieValue(getCookie(), name);

      return value === undefined ? value : serializer.parse(value);
    },

    set(name, value, options) {
      setCookie(stringifyCookie(name, serializer.stringify(value), options));
    },

    async getSigned(name, secret) {
      const value = await getSignedCookieValue(getCookie(), name, secret);

      return value === undefined ? value : serializer.parse(value);
    },

    async setSigned(name, value, secret, options) {
      setCookie(await stringifySignedCookie(name, serializer.stringify(value), secret, options));
    },

    has(name) {
      return getCookieValue(getCookie(), name) !== undefined;
    },

    delete(name) {
      setCookie(stringifyCookie(name, '', { maxAge: 0 }));
    },

    clear() {
      for (const name of getCookieNames(getCookie())) {
        setCookie(stringifyCookie(name, '', { maxAge: 0 }));
      }
    },

    [Symbol.iterator]() {
      return Object.entries(getAll()).values();
    },
  };
}

const defaultSerializer: Serializer = {
  parse: str => str,
  stringify: String,
};
