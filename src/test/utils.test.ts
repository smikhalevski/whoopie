import { describe, expect, test } from 'vitest';
import { getCookieValue } from '../main/utils.js';

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
    expect(getCookieValue(encodeURIComponent('aaa;bbb') + '=ccc', 'aaa;bbb')).toBe('ccc');
    expect(getCookieValue('aaa=' + encodeURIComponent('bbb;ccc'), 'aaa')).toBe('bbb;ccc');
  });
});
