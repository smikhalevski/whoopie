import { Serializer } from './types.js';

/**
 * An adapter that serializes cookie values with {@link JSON}.
 */
export const jsonCookieSerializer: Serializer = {
  parse(text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },

  stringify(value) {
    const json = JSON.stringify(value);

    if (
      json.charCodeAt(0) === 34 &&
      json !== '"true"' &&
      json !== '"false"' &&
      json !== '"null"' &&
      json.slice(1, -1) === value
    ) {
      return value;
    } else {
      return json;
    }
  },
};
