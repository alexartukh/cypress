# Cypress web tester

> **Status: work in progress.**
> A Cypress + TypeScript port of my Playwright suite
> [alexartukh/playwright](https://github.com/alexartukh/playwright).
> Both projects test the same public demo shop, so the two tools can be compared on identical scenarios.

The tests run against [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (Toolshop),
a public e-commerce site made for test automation practice. No local environment is needed.

> **Runs locally only.** The demo site answers `403 Forbidden` to Cypress runs from GitHub-hosted
> runners (all retries fail immediately on the first `cy.visit`), while the Playwright smoke suite
> from the same runners passes. So this project has no CI workflow; the tests are run on my machine.

## Ported so far

| Feature | Playwright | Cypress |
|---|---|---|
| Login: register via API, log in through the UI | ✅ | ✅ |
| Login: register and log in via API (token in `localStorage`) | ✅ | ✅ |
| Search (parametrized: 1, 4 and 0 results) | ✅ | ✅ |
| Search with mocked "out of stock" response | ✅ | in progress |
| Place an order (registered user / guest) | ✅ | in progress |
| Cart total calculation | ✅ | planned |
| Accessibility (ARIA labels, axe-core) | ✅ | not ported |
| Visual comparison of toasts | ✅ | planned (plugin needed) |

## Project structure

```
cypress.config.ts        base URL, viewport, exposed options, grep plugin
cypress/
├─ e2e/                  test files (*.cy.ts)
├─ pages/                page objects (selectors + actions)
└─ support/
   ├─ e2e.ts             loaded before every test file
   ├─ commands.ts        custom commands: cy.registerUser(), cy.loginByApi()
   ├─ tags.ts            test tags
   └─ utils.ts           helpers
```

## Running

```bash
npm install

npm run cy:open          # interactive runner (time-travel debugging)
npm test                 # headless run of all tests
npm run test:smoke       # only tests tagged @smoke
```

Options:

```bash
npx cypress run --browser firefox                 # another browser
npx cypress run --expose lang=de                  # site language (default: en)
npx cypress run --expose grepTags=-@advanced      # everything except @advanced
npx cypress run --expose lang=de,grepTags=@smoke  # combined
```

## Tags

| Tag | Meaning |
|---|---|
| `@smoke` | minimal "site is alive" set |
| `@advanced` | requires a logged-in user |
| `@screentest` | visual tests |
| `@a11y` | accessibility checks |

Tags are implemented with the official [`@cypress/grep`](https://www.npmjs.com/package/@cypress/grep) plugin.
Tags come from constants in `cypress/support/tags.ts`, so the plugin filters at run time:
tests that do not match are reported as *pending*.

## Retries

`cypress run` retries a failed test up to 2 times, `cypress open` does not retry
(`retries: { runMode: 2, openMode: 0 }`), so flaky behaviour is visible when debugging locally.

## Findings

- **The search API uses the HTTP `QUERY` method**, not `GET`
  (`QUERY https://api.practicesoftwaretesting.com/products/search`, parameters in the body).
  An intercept written as `cy.intercept('GET', ...)` never matches; the tests intercept by URL only.
- **A failing `beforeEach` skips the rest of the suite** in Cypress (Playwright reports each test separately),
  so one blocked page load shows up as 1 failed + N skipped.

## How the port maps Playwright concepts to Cypress

| Playwright | Cypress |
|---|---|
| `async` / `await` on every step | commands are queued; values are read in `.then()` or via aliases |
| `Locator` objects in page objects | selector strings + `cy.get()` |
| custom fixtures (`registeredUser`, `loggedInUser`) | custom commands in `support/commands.ts` |
| `request.post()` | `cy.request()` |
| `page.addInitScript()` | `cy.visit(url, { onBeforeLoad })` |
| `waitForResponse()` / `page.route()` | `cy.intercept()` + `cy.wait('@alias')` |
| projects (Chrome/Firefox × EN/DE) in one run | separate runs: `--browser` and `--expose lang=...` |
| `expect(...).toBe()` (Jest style) | `expect(...).to.equal()` (Chai) and `.should()` for retried DOM checks |

## Stack

Cypress 16 · TypeScript · @cypress/grep
