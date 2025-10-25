import { getCookieNames, getCookieValue, parseCookies, stringifyCookie } from './utils.js';
import { CookieStorage, CookieStorageOptions } from './types.js';

/**
 * Creates a new cookie storage that uses getter and setter to access cookies.
 */
export function createCookieStorage<Cookies extends Record<string, any>>(
  options: CookieStorageOptions
): CookieStorage<Cookies>;

export function createCookieStorage(options: CookieStorageOptions): CookieStorage {
  const { getCookie, setCookie, serializer } = options;

  const getAll = () => {
    const record = parseCookies(getCookie());

    if (serializer === undefined) {
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

      return serializer === undefined || value === undefined ? value : serializer.parse(value);
    },

    set(name, value, options) {
      setCookie(stringifyCookie(name, serializer === undefined ? String(value) : serializer.stringify(value), options));
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

    *[Symbol.iterator]() {
      return Object.entries(getAll());
    },
  };
}
