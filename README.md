# Cypress web tester

> **Status: work in progress.**
> A Cypress + TypeScript port of my Playwright suite
> [alexartukh/playwright](https://github.com/alexartukh/playwright).
> Both projects test the same public demo shop, so the two tools can be compared on identical scenarios.

The tests run against [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (Toolshop),
a public e-commerce site made for test automation practice. No local environment is needed.

## Ported so far

| Feature | Playwright | Cypress |
|---|---|---|
| Login: register via API, log in through the UI | ✅ | ✅ |
| Login: register and log in via API (token in `localStorage`) | ✅ | ✅ |
| Search (parametrized, with mocked "out of stock" response) | ✅ | in progress |
| Place an order (registered user / guest) | ✅ | in progress |
| Cart total calculation | ✅ | planned |
| Accessibility (axe-core) | ✅ | planned (`cypress-axe`) |
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
