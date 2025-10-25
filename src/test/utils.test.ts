import { describe, expect, test } from 'vitest';
import { getCookieNames, getCookieValue, parseCookies, stringifyCookie } from '../main/utils.js';

describe('parseCookies', () => {
  test('returns cookies as a record', () => {
    expect(parseCookies('aaa=bbb')).toStrictEqual({ aaa: 'bbb' });
    expect(parseCookies('aaa===bbb;ddd')).toStrictEqual({ aaa: '==bbb' });
    expect(parseCookies(';;aaa=bbb')).toStrictEqual({ aaa: 'bbb' });
    expect(parseCookies(';;aaa=;ddd')).toStrictEqual({ aaa: '' });
    expect(parseCookies(';;aaa=   ;ddd')).toStrictEqual({ aaa: '' });
    expect(parseCookies('   aaa   =   bbb   ')).toStrictEqual({ aaa: 'bbb' });
    expect(parseCookies('   aaa   =   bbb   ;   ddd   =   eee')).toStrictEqual({ aaa: 'bbb', ddd: 'eee' });
    expect(parseCookies('   aaa   =   bbb   ;   ddd   =   eee')).toStrictEqual({ aaa: 'bbb', ddd: 'eee' });
    expect(parseCookies('   aaa   =   bbb   ccc   ')).toStrictEqual({ aaa: 'bbb   ccc' });
    expect(parseCookies('aaa%3Bbbb=ccc')).toStrictEqual({ 'aaa;bbb': 'ccc' });
    expect(parseCookies('aaa=bbb%3Bccc')).toStrictEqual({ aaa: 'bbb;ccc' });

    expect(parseCookies([])).toStrictEqual({});
    expect(parseCookies(['aaa=bbb'])).toStrictEqual({ aaa: 'bbb' });
    expect(parseCookies(['aaa=bbb', 'ccc=ddd'])).toStrictEqual({ aaa: 'bbb', ccc: 'ddd' });
    expect(parseCookies(['aaa=bbb', 'aaa=ddd'])).toStrictEqual({ aaa: 'ddd' });
  });
});

describe('getCookieNames', () => {
  test('returns unique names of cookies', () => {
    expect(getCookieNames('aaa=bbb')).toStrictEqual(['aaa']);
    expect(getCookieNames('aaa===bbb;ddd')).toStrictEqual(['aaa']);
    expect(getCookieNames(';;aaa=bbb')).toStrictEqual(['aaa']);
    expect(getCookieNames(';;aaa=;ddd')).toStrictEqual(['aaa']);
    expect(getCookieNames(';;aaa=   ;ddd')).toStrictEqual(['aaa']);
    expect(getCookieNames('   aaa   =   bbb   ')).toStrictEqual(['aaa']);
    expect(getCookieNames('   aaa   =   bbb   ;   ddd   =   eee')).toStrictEqual(['aaa', 'ddd']);
    expect(getCookieNames('   aaa   =   bbb   ;   ddd   =   eee')).toStrictEqual(['aaa', 'ddd']);
    expect(getCookieNames('   aaa   =   bbb   ccc   ')).toStrictEqual(['aaa']);
    expect(getCookieNames('aaa%3Bbbb=ccc')).toStrictEqual(['aaa;bbb']);
    expect(getCookieNames('aaa=bbb%3Bccc')).toStrictEqual(['aaa']);

    expect(getCookieNames([])).toStrictEqual([]);
    expect(getCookieNames(['aaa=bbb'])).toStrictEqual(['aaa']);
    expect(getCookieNames(['aaa=bbb', 'ccc=ddd'])).toStrictEqual(['aaa', 'ccc']);
    expect(getCookieNames(['aaa=bbb', 'aaa=ddd'])).toStrictEqual(['aaa']);
  });
});

describe('getCookieValue', () => {
  test('returns cookie value', () => {
    expect(getCookieValue('aaa=bbb', 'aaa')).toBe('bbb');
    expect(getCookieValue('aaa===bbb;ddd', 'aaa')).toBe('==bbb');
    expect(getCookieValue(';;aaa=bbb', 'aaa')).toBe('bbb');
    expect(getCookieValue(';;aaa=;ddd', 'aaa')).toBe('');
    expect(getCookieValue(';;aaa=   ;ddd', 'aaa')).toBe('');
    expect(getCookieValue('   aaa   =   bbb   ', 'aaa')).toBe('bbb');
    expect(getCookieValue('   aaa   =   bbb   ;   ddd   =   eee', 'aaa')).toBe('bbb');
    expect(getCookieValue('   aaa   =   bbb   ;   ddd   =   eee', 'ddd')).toBe('eee');
    expect(getCookieValue('   aaa   =   bbb   ccc   ', 'aaa')).toBe('bbb   ccc');
    expect(getCookieValue('aaa%3Bbbb=ccc', 'aaa;bbb')).toBe('ccc');
    expect(getCookieValue('aaa=bbb%3Bccc', 'aaa')).toBe('bbb;ccc');
  });
});

describe('stringifyCookie', () => {
  test('returns cookie value', () => {
    expect(stringifyCookie('aaa', 'bbb')).toBe('aaa=bbb');
    expect(stringifyCookie('aaa;ccc', 'bbb')).toBe('aaa%3Bccc=bbb');
    expect(stringifyCookie('aaa%ccc', 'bbb')).toBe('aaa%25ccc=bbb');
    expect(stringifyCookie('aaa%3Bccc', 'bbb')).toBe('aaa%253Bccc=bbb');
    expect(stringifyCookie('aaa', 'bbb;ccc')).toBe('aaa=bbb%3Bccc');
    expect(stringifyCookie('aaa', 'bbb%ccc')).toBe('aaa=bbb%25ccc');
    expect(stringifyCookie('aaa', 'bbb%3Bccc')).toBe('aaa=bbb%253Bccc');
    expect(stringifyCookie('aaa', 'bbb', { expiresAt: 'hello' })).toBe('aaa=bbb');
    expect(stringifyCookie('aaa', 'bbb', { expiresAt: 0 })).toBe('aaa=bbb; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(stringifyCookie('aaa', 'bbb', { expiresAt: new Date('hello') })).toBe('aaa=bbb');
    expect(stringifyCookie('aaa', 'bbb', { maxAge: 'hello' as unknown as number })).toBe('aaa=bbb');
    expect(stringifyCookie('aaa', 'bbb', { maxAge: 0 })).toBe('aaa=bbb; Max-Age=0');
  });
});
