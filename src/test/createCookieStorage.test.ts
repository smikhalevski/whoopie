import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CookieStorage, createCookieStorage, Serializer } from '../main/index.js';

const getCookieMock = vi.fn();

const setCookieMock = vi.fn();

const serializerMock = {
  parse: vi.fn(),
  stringify: vi.fn(),
} satisfies Serializer;

let cookieStorage: CookieStorage;

beforeEach(() => {
  getCookieMock.mockReset();
  setCookieMock.mockReset();
  serializerMock.parse.mockReset();
  serializerMock.stringify.mockReset();

  cookieStorage = createCookieStorage({
    getCookie: getCookieMock,
    setCookie: setCookieMock,
  });
});

describe('get', () => {
  test('reads cookie value without a serializer', () => {
    getCookieMock.mockReturnValue('aaa=bbb');

    expect(cookieStorage.get('aaa')).toBe('bbb');

    expect(getCookieMock).toHaveBeenCalledTimes(1);
  });

  test('reads cookie value with a serializer', () => {
    cookieStorage = createCookieStorage({
      getCookie: getCookieMock,
      setCookie: setCookieMock,
      serializer: serializerMock,
    });

    serializerMock.parse.mockReturnValue('xxx');
    getCookieMock.mockReturnValue('aaa=bbb');

    expect(cookieStorage.get('aaa')).toBe('xxx');

    expect(getCookieMock).toHaveBeenCalledTimes(1);
    expect(serializerMock.parse).toHaveBeenCalledTimes(1);
    expect(serializerMock.parse).toHaveBeenNthCalledWith(1, 'bbb');
  });
});

describe('set', () => {
  test('writes cookie value without a serializer', () => {
    cookieStorage.set('aaa', 'bbb', { isHttpOnly: true });

    expect(setCookieMock).toHaveBeenCalledTimes(1);
    expect(setCookieMock).toHaveBeenNthCalledWith(1, 'aaa=bbb; HttpOnly');
  });

  test('writes cookie value with a serializer', () => {
    cookieStorage = createCookieStorage({
      getCookie: getCookieMock,
      setCookie: setCookieMock,
      serializer: serializerMock,
    });

    serializerMock.stringify.mockReturnValue('"xxx"');

    cookieStorage.set('aaa', 'bbb');

    expect(setCookieMock).toHaveBeenCalledTimes(1);
    expect(setCookieMock).toHaveBeenNthCalledWith(1, 'aaa="xxx"');
    expect(serializerMock.stringify).toHaveBeenCalledTimes(1);
    expect(serializerMock.stringify).toHaveBeenNthCalledWith(1, 'bbb');
  });
});

describe('getSigned', () => {
  test('reads signed cookie value without a serializer', async () => {
    getCookieMock.mockReturnValue('aaa=bbb.WMi69G3kT+oC9YzBibG40w2CjPA0JXk2SlP1futbf1s=');

    await expect(cookieStorage.getSigned('aaa', 'xxx')).resolves.toBe('bbb');

    expect(getCookieMock).toHaveBeenCalledTimes(1);
  });

  test('returns undefined if signature is invalid', async () => {
    getCookieMock.mockReturnValue('aaa=bbb.XXXXXG3kT+oC9YzBibG40w2CjPA0JXk2SlP1futbf1s=');

    await expect(cookieStorage.getSigned('aaa', 'xxx')).resolves.toBe(undefined);
  });

  test('reads signed cookie value with a serializer', async () => {
    cookieStorage = createCookieStorage({
      getCookie: getCookieMock,
      setCookie: setCookieMock,
      serializer: serializerMock,
    });

    serializerMock.parse.mockReturnValue('zzz');
    getCookieMock.mockReturnValue('aaa=bbb.WMi69G3kT+oC9YzBibG40w2CjPA0JXk2SlP1futbf1s=');

    await expect(cookieStorage.getSigned('aaa', 'xxx')).resolves.toBe('zzz');

    expect(getCookieMock).toHaveBeenCalledTimes(1);
    expect(serializerMock.parse).toHaveBeenCalledTimes(1);
    expect(serializerMock.parse).toHaveBeenNthCalledWith(1, 'bbb');
  });
});

describe('setSigned', () => {
  test('writes signed cookie value without a serializer', async () => {
    await cookieStorage.setSigned('aaa', 'bbb', 'xxx', { isHttpOnly: true });

    expect(setCookieMock).toHaveBeenCalledTimes(1);
    expect(setCookieMock).toHaveBeenNthCalledWith(1, 'aaa=bbb.WMi69G3kT+oC9YzBibG40w2CjPA0JXk2SlP1futbf1s=; HttpOnly');
  });

  test('writes cookie value with a serializer', async () => {
    cookieStorage = createCookieStorage({
      getCookie: getCookieMock,
      setCookie: setCookieMock,
      serializer: serializerMock,
    });

    serializerMock.stringify.mockReturnValue('"xxx"');

    await cookieStorage.setSigned('aaa', 'bbb', 'zzz', { isHttpOnly: true });

    expect(setCookieMock).toHaveBeenCalledTimes(1);
    expect(setCookieMock).toHaveBeenNthCalledWith(
      1,
      'aaa="xxx".aUUpnbB5nQeYMbPFBE1Ri1YTxv7n7cHlXYaeCZA9u4M=; HttpOnly'
    );
    expect(serializerMock.stringify).toHaveBeenCalledTimes(1);
    expect(serializerMock.stringify).toHaveBeenNthCalledWith(1, 'bbb');
  });
});

describe('getAll', () => {
  test('returns all cookies as a record', () => {
    getCookieMock.mockReturnValue('aaa=bbb;ccc=ddd');

    expect(cookieStorage.getAll()).toStrictEqual({ aaa: 'bbb', ccc: 'ddd' });
  });

  test('returns all cookies as a record with a serializer', () => {
    cookieStorage = createCookieStorage({
      getCookie: getCookieMock,
      setCookie: setCookieMock,
      serializer: serializerMock,
    });

    getCookieMock.mockReturnValue('aaa=bbb;ccc=ddd');

    serializerMock.parse.mockReturnValueOnce('xxx');
    serializerMock.parse.mockReturnValueOnce('yyy');

    expect(cookieStorage.getAll()).toStrictEqual({ aaa: 'xxx', ccc: 'yyy' });
  });
});

describe('getNames', () => {
  test('returns all cookie names', () => {
    getCookieMock.mockReturnValue('aaa=bbb;ccc=ddd');

    expect(cookieStorage.getNames()).toStrictEqual(['aaa', 'ccc']);
  });
});

describe('has', () => {
  test('returns true if cookie with the given name exists', () => {
    getCookieMock.mockReturnValue('aaa=bbb;ccc=ddd');

    expect(cookieStorage.has('ccc')).toBe(true);
  });
});

describe('delete', () => {
  test('deletes a cookie by name', () => {
    cookieStorage.delete('aaa');

    expect(setCookieMock).toHaveBeenCalledTimes(1);
    expect(setCookieMock).toHaveBeenNthCalledWith(1, 'aaa=; Max-Age=0');
  });
});

describe('clear', () => {
  test('deletes all cookies', () => {
    getCookieMock.mockReturnValue('aaa=bbb; ccc=ddd');

    cookieStorage.clear();

    expect(setCookieMock).toHaveBeenCalledTimes(2);
    expect(setCookieMock).toHaveBeenNthCalledWith(1, 'aaa=; Max-Age=0');
    expect(setCookieMock).toHaveBeenNthCalledWith(2, 'ccc=; Max-Age=0');
  });
});

describe('[iterator]', () => {
  test('iterates over all cookie entries', () => {
    getCookieMock.mockReturnValue('aaa=bbb; ccc=ddd');

    expect(Array.from(cookieStorage)).toStrictEqual([
      ['aaa', 'bbb'],
      ['ccc', 'ddd'],
    ]);
  });
});
