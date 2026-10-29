# Cypress web tester

> **Status: ported**, except the accessibility tests (see below).
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
| Search with mocked "out of stock" response | ✅ | ✅ |
| Place an order (registered user / guest) | ✅ | ✅ |
| Cart total calculation | ✅ | ✅ |
| Visual comparison of toasts | ✅ | ✅ (plugin) |
| Accessibility (ARIA labels, axe-core) | ✅ | not ported |

The ARIA label check relies on Playwright's `ariaSnapshot()` (the browser's accessibility tree);
Cypress has no equivalent, and a hand-made approximation was not reliable enough, so these tests stay Playwright-only.

## Project structure

```
cypress.config.ts        base URL, viewport, retries, exposed options, plugins
cypress/
├─ e2e/                  test files (*.cy.ts)
├─ pages/                page objects (selectors + actions)
├─ snapshots/            reference images for visual tests (committed)
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
npx cypress run --expose grep="Pliers"            # tests whose title contains a text
npx cypress run --expose updateSnapshots=true     # re-create reference images
```

There is no button to run a single test in the `cypress open` window (only whole spec files);
for debugging one test use `it.only(...)` or start the runner with `--expose grep="..."`.

## Tags

| Tag | Meaning |
|---|---|
| `@smoke` | minimal "site is alive" set |
| `@advanced` | requires a logged-in user |
| `@screentest` | visual tests |

Tags are implemented with the official [`@cypress/grep`](https://www.npmjs.com/package/@cypress/grep) plugin.
Tags come from constants in `cypress/support/tags.ts`, so the plugin filters at run time:
tests that do not match are reported as *pending*.

## Visual tests

Implemented with [`@simonsmith/cypress-image-snapshot`](https://www.npmjs.com/package/@simonsmith/cypress-image-snapshot)
(Cypress has no built-in image comparison). Playwright keeps one reference image per project;
Cypress has no projects, so the browser and language are part of the image name
(`toasts-stack-chrome-en.snap.png`). The first run creates the reference, later runs compare with it
(up to 10% of pixels may differ because the toasts have an animated progress bar).
Images from `cypress open` and headless `cypress run` can differ slightly, so references should be
created the same way they are checked.

## Retries

`cypress run` retries a failed test up to 2 times, `cypress open` does not retry
(`retries: { runMode: 2, openMode: 0 }`), so flaky behaviour is visible when debugging locally.

## Findings

- **The search API uses the HTTP `QUERY` method**, not `GET`
  (`QUERY https://api.practicesoftwaretesting.com/products/search`, parameters in the body).
  An intercept written as `cy.intercept('GET', ...)` never matches; the tests intercept by URL only.
- **A failing `beforeEach` skips the rest of the suite** in Cypress (Playwright reports each test separately),
  so one blocked page load shows up as 1 failed + N skipped.
- **"0 elements" works only for the last step of a query chain.** `cy.get('a.card').filter(':has(...)')`
  fails when there are no cards at all, because `cy.get` must find something first.
  A single selector (`cy.get('a.card:has(...)')`) can return zero elements.

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
| `locator.filter({ has: ... })` | jQuery selector `:has(...)` |
| `locator.nth(1)` / `innerText()` | `.eq(1)` / `.invoke('text')` |
| `toHaveScreenshot()` | `.matchImageSnapshot()` (plugin) |
| `test.only` / UI mode play button | `it.only` (no per-test button in the runner) |

## Stack

Cypress 16 · TypeScript · @cypress/grep · @simonsmith/cypress-image-snapshot
