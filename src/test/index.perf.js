import { describe, measure, test, beforeEach } from 'toofast';
import * as jsCookie from 'js-cookie';
import * as whoopie from '../../lib/index.js';

beforeEach(() => {
  global.document = {
    cookie: 'user_id=42; auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9; preferences=%7B%22lang%22%3A%22en%22%7D',
  };
});

describe('get value', () => {
  test('js-cookie', () => {
    measure(() => {
      jsCookie.default.get('auth_token');
    });
  });

  test('whoopie', () => {
    measure(() => {
      whoopie.documentCookieStorage.get('auth_token');
    });
  });
});

describe('set value', () => {
  test('js-cookie', () => {
    measure(() => {
      jsCookie.default.set('auth_token', 'xxx');
    });
  });

  test('whoopie', () => {
    measure(() => {
      whoopie.documentCookieStorage.set('auth_token', 'xxx');
    });
  });
});
