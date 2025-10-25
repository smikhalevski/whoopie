import { createCookieStorage } from './createCookieStorage.js';
import { jsonCookieSerializer } from './jsonCookieSerializer.js';

/**
 * Cookie storage that uses {@link document.cookie} to read and write cookies.
 */
export const documentCookieStorage = createCookieStorage({
  getCookie() {
    return document.cookie;
  },

  setCookie(cookie) {
    document.cookie = cookie;
  },

  serializer: jsonCookieSerializer,
});
