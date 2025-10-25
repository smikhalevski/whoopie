import { beforeEach, expect, test } from 'vitest';
import { documentCookieStorage } from '../main/index.js';

beforeEach(() => {
  globalThis.document = { cookie: 'aaa=bbb; ccc={"xxx":111}' } as Document;
});

test('reads document cookie', () => {
  expect(documentCookieStorage.get('aaa')).toBe('bbb');
  expect(documentCookieStorage.get('ccc')).toStrictEqual({ xxx: 111 });
});

test('writes document cookie', () => {
  documentCookieStorage.set('ccc', { zzz: 222 });

  expect(document.cookie).toBe('ccc={"zzz":222}');
});
