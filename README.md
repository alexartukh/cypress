# DRAFT — Cypress web tester

> **Status: early learning draft (August 2026).**
> Kept as a record of my progress. My current, cleaner end-to-end work is in
> [alexartukh/playwright](https://github.com/alexartukh/playwright) — Playwright + TypeScript with page objects, fixtures, API calls, network mocking and CI.

## What it is

My first experiments with [Cypress](https://www.cypress.io). The test places an order in a locally hosted
e-commerce shop (CosmoShop, German storefront) running in a Vagrant virtual machine, and then checks
that the order really exists in the shop database.

## What is interesting here

- **Full order flow in the UI** — login, product page, cart, checkout steps, thank-you page.
- **Database check after the UI test.** The order number is read from the thank-you page and passed to a
  Cypress **task** (`cy.task('checkOrderNumber', ...)`). The task runs in Node.js, opens an **SSH tunnel**
  to the virtual machine (`ssh2`) and queries **MySQL** (`mysql2`) to confirm that the order was stored.
  This connects what the user sees with what the backend actually saved.
- A simple Cypress task example (`sumNumbers`) showing how test code talks to the Node.js side.

## Known limitations (why it is a draft)

- Runs only against my local shop VM — it cannot be executed without that environment.
- Assertions check text anywhere in `body` instead of specific elements, and the selectors depend on German UI texts.
- No page objects, a single long test.
- `cypress/e2e/test.js` is a standalone Node.js script used to try out the SSH tunnel; it is not a Cypress spec.

I describe how I would fix these issues — and did fix them later — in the Playwright project linked above.

## Running (requires the local shop VM)

```bash
npm install
```

Connection settings are taken from environment variables (nothing secret is stored in the repository).
PowerShell example:

```powershell
$env:SSH_KEY_PATH = "C:\path\to\.vagrant\machines\default\virtualbox\private_key"
$env:DB_USER      = "..."
$env:DB_PASSWORD  = "..."
$env:DB_NAME      = "..."
# optional, defaults shown: SSH_HOST=127.0.0.1, SSH_PORT=2222, SSH_USER=vagrant, DB_HOST=127.0.0.1, DB_PORT=3306

npm run cy:open     # interactive Cypress runner
npm test            # headless run
```

## Stack

Cypress 15 · JavaScript · Node.js tasks · ssh2 · mysql2
