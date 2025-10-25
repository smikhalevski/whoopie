import { Serializer } from './types.js';

/**
 * An adapter that serializes cookie values with {@link JSON}.
 *
 * @group Storage
 */
export const jsonCookieSerializer: Serializer = {
  parse(str) {
    const charCode = str.charCodeAt(0);

    if (
      str === 'null' ||
      str === 'true' ||
      str === 'false' ||
      charCode === /* { */ 123 ||
      charCode === /* [ */ 91 ||
      charCode === /* " */ 34 ||
      (charCode >= /* 0 */ 48 && charCode <= /* 9 */ 57)
    ) {
      try {
        return JSON.parse(str);
      } catch {}
    }

    return str;
  },

  stringify(value) {
    const json = JSON.stringify(value);

    if (
      json.charCodeAt(0) !== /* " */ 34 ||
      json === '"null"' ||
      json === '"true"' ||
      json === '"false"' ||
      json.slice(1, -1) !== value
    ) {
      return json;
    }

    return value;
  },
};
