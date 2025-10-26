# whoopie 🍪

Super-fast cookie parser and storage that works on both server and client.

[Just 2 kB gzipped](https://bundlephobia.com/package/whoopie) with zero dependencies.

```shell
npm install --save-prod whoopie
```

🔰 [API documentation is available here.](https://smikhalevski.github.io/whoopie)

# Usage

Use [`documentCookieStorage`](https://smikhalevski.github.io/whoopie/variables/documentCookieStorage.html) to read and
write cookies from `document.cookie`:

```ts
import { documentCookieStorage } from 'whoopie';

documentCookieStorage.set('hello', 'world');

documentCookieStorage.get('hello');
// ⮕ 'world'
```

JSON cookies are supported out of the box:

```ts
documentCookieStorage.set('users', ['bob', 'bill', 'barry']);

documentCookieStorage.get('users');
// ⮕ ['bob', 'bill', 'barry']
```

Use [`createCookieStorage`](https://smikhalevski.github.io/whoopie/functions/createCookieStorage.html) to create
a custom cookie storage:

```ts
import { createCookieStorage, jsonCookieSerializer } from 'whoopie';

const myStorage = createCookieStorage({
  getCookie() {
    return document.cookie;
  },

  setCookie(cookie) {
    document.cookie = cookie;
  },

  serializer: jsonCookieSerializer,
});

myStorage.set('hello', 'world');

myStorage.get('hello');
// ⮕ 'world'
```

Here, [`jsonCookieSerializer`](https://smikhalevski.github.io/whoopie/variables/jsonCookieSerializer.html) is a built-in
cookie value serializer that supports JSON values.

You can create server-side cookie storage that reads cookies from a request and writes to the response:

```ts
import { createCookieStorage, jsonCookieSerializer } from 'whoopie';

function createServerCookieStorage(request: Request, response: Response): CookieStorage {
  return createCookieStorage({
    getCookie() {
      return request.headers.get('Cookie');
    },

    setCookie(cookie) {
      response.headers.set('Set-Cookie', cookie);
    },

    serializer: jsonCookieSerializer,
  });
}
```

Be sure to create a new cookie store for each request.

```ts
export function handleRequest(request: Request, response: Response) {
  const myStorage = createServerCookieStorage(request, response);

  myStorage.set('hello', 'world');

  myStorage.get('hello');
}
```

# Utils

Whoopie exports a set of functional utilities that streamline working with cookies without the need to create a storage.

Parse [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cookie) header value or
`document.cookie` as a key-value mapping:

```ts
parseCookies('hello=world');
// ⮕ { hello: 'world' }
```

Get names of all cookies:

```ts
getCookieNames('hello=world');
// ⮕ ['hello']
```

Get value of a cookie by its name:

```ts
getCookieValue('hello=world', 'hello');
// ⮕ 'world'
```

Stringify a cookie, so it can be used as
a [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) header value or
assigned to `document.cookie`:

```ts
stringifyCookie('hello', 'world', { maxAge: 24 * 60 * 60 });
// ⮕ 'hello=world; Max-Age=86400'
```
