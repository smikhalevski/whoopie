<p align="center"><img src="./assets/logo.png" alt="Whoopie" width="500" /></p>

Super-fast cookie parser and storage that works on both server and client.

[Just 1 kB gzipped](https://bundlephobia.com/package/whoopie) with zero dependencies.

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
cookie value serializer that supports JSON values. This serializer never throws errors during parsing. If a cookie value
isn't valid JSON, it's returned as a string.

```ts
// Unambiguous strings aren't wrapped in double quotes
jsonCookieSerializer.stringify('hello');
// ⮕ 'hello'

jsonCookieSerializer.parse('hello');
// ⮕ 'hello'

// Ambiguous strings are wrapped in double quotes
jsonCookieSerializer.stringify('true');
// ⮕ '"true"'

jsonCookieSerializer.stringify(42);
// ⮕ '42'

jsonCookieSerializer.parse('42');
// ⮕ 42
```

You can create server-side cookie storage that reads cookies from a request and writes to the response:

```ts
import { createCookieStorage, jsonCookieSerializer } from 'whoopie';

function createServerCookieStorage(requestHeaders: Headers, responseHeaders: Headers): CookieStorage {
  return createCookieStorage({
    getCookie() {
      return requestHeaders.get('Cookie');
    },

    setCookie(cookie) {
      responseHeaders.set('Set-Cookie', cookie);
    },

    serializer: jsonCookieSerializer,
  });
}
```

Be sure to create a new cookie store for each request.

```ts
export function handleRequest(request: Request): Response {
  const responseHeaders = new Headers();

  const myStorage = createServerCookieStorage(request.headers, responseHeaders);

  myStorage.set('hello', 'world');

  myStorage.get('hello');

  return Response.json({}, { headers: responseHeaders });
}
```

# Signed cookies

Signed cookies are needed to ensure integrity and authenticity of data stored in the browser. Ordinary cookies are
stored and sent by the browser, but the user can modify them using developer tools.

Signed cookies guarantee that the cookies value wasn't forged by adding a signature to the cookie value and verifying
this signature when cookie is read:

```ts
import { documentCookieStorage } from 'whoopie';

const SECRET_KEY = 'my_secret_key';

documentCookieStorage.setSigned('hello', 'world', SECRET_KEY);

documentCookieStorage.getSigned('hello', SECRET_KEY);
// ⮕ 'world'
```

Make sure that secret key cannot be accessed by the user.

# Utilities

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

# Type-safe cookies

Add typings to the `documentCookieStorage`:

```ts
interface MyCookies {
  userAge?: number;
}

export const myStorage: CookieStorage<MyCookies> = documentCookieStorage;
```

`myStorage` doesn't provide runtime type-safety, but provides compile-time type safety:

```ts
myStorage.set('userAge', 'hello');
// ❌ TypeScript error: userAge must be of type number

myStorage.get('userAge');
// 🟡 Ooops, type isn't guaranteed at runtime
```

The types of JSON cookies cannot be guaranteed at runtime, as cookies can be altered by the user or directly mutated via
`document.cookie`. To mitigate this issue, use a validation library such as [Doubter](https://megastack.dev/doubter):

```ts
import * as d from 'doubter';

// ✅ Runtime type-safety is ensured
const userAge = d.number().catch().parse(myStorage.get('userAge'));
// ⮕ number | undefined
```
