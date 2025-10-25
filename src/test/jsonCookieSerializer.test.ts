import { expect, test } from 'vitest';
import { jsonCookieSerializer } from '../main/index.js';

test('stringifies value', () => {
  expect(jsonCookieSerializer.stringify(null)).toBe('null');
  expect(jsonCookieSerializer.stringify(true)).toBe('true');
  expect(jsonCookieSerializer.stringify(false)).toBe('false');
  expect(jsonCookieSerializer.stringify('aaa')).toBe('aaa');
  expect(jsonCookieSerializer.stringify('true')).toBe('"true"');
  expect(jsonCookieSerializer.stringify({ aaa: 'bbb' })).toBe('{"aaa":"bbb"}');
  expect(jsonCookieSerializer.stringify(['aaa', 'bbb'])).toBe('["aaa","bbb"]');
});

test('parses value', () => {
  expect(jsonCookieSerializer.parse(jsonCookieSerializer.stringify(null))).toBe(null);
  expect(jsonCookieSerializer.parse(jsonCookieSerializer.stringify(true))).toBe(true);
  expect(jsonCookieSerializer.parse(jsonCookieSerializer.stringify(false))).toBe(false);
  expect(jsonCookieSerializer.parse(jsonCookieSerializer.stringify('aaa'))).toBe('aaa');
  expect(jsonCookieSerializer.parse(jsonCookieSerializer.stringify('true'))).toBe('true');
  expect(jsonCookieSerializer.parse(jsonCookieSerializer.stringify({ aaa: 'bbb' }))).toStrictEqual({ aaa: 'bbb' });
  expect(jsonCookieSerializer.parse(jsonCookieSerializer.stringify(['aaa', 'bbb']))).toStrictEqual(['aaa', 'bbb']);
});
