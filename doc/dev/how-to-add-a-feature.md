# How to Add a Feature

## High-Level Organisation

As a rule:

- Open an issue (work towards an issue)
- make a branch

## Development

- Add unit tests via the configured `vitest` environment (see config in `nuxt.config.ts` and `vitest.config.ts`)
  - It's not required to use TDD, but it may make sense, especially when working on logic-heave features
  - However, each added feature should at least be convered in regards to basic happy path