## Tech Stack

- Standard Nuxt app
    - Meaning, per-default, we are doing things *server-side*

### Nuxt Plugins

- `eslint` is setup. Don't forget to run linter.
- utilize `@nuxt/fonts` for fonts. keep it basic.
- use `@nuxt/icon`, so icons should be valid [iconify](https://iconify.design/)
- use `@nuxt/test-utils` to get good unit test coverage
- we have `@nuxt/ui`, so use `Tailwind 4` and `Reka UI` (see [doc](https://ui.nuxt.com/)).
    - Avoid manual CSS when possible

### Data

- source of truth is a local, per-user `dexie.js` database
    - must, of course, be used with `ClientOnly`