# Booking Flow E2E Tests

This project contains end-to-end (E2E) tests for the booking flow of a hotel reservation system using [Playwright](https://playwright.dev/) and [TypeScript](https://www.typescriptlang.org/).

## Features

- Automated booking flow tests
- Modular Page Object Model for maintainability
- Faker for generating random user data
- Validates booking details, payment calculations, and reservation dates

## Prerequisites

- **Node.js** (v16+ recommended)
- **npm** (Node Package Manager)

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rafaeltuvera/playwright-booking-flow-tests.git
   cd playwright-booking-flow-tests

2. **Install dependencies:**

   ```bash
   npm install
    ```
3. Install Playwright browsers:
     ```bash
   npx playwright install
    ```

## Running Tests
1. **Run all tests:**

   ```bash
   npx playwright test
   ```

2. **Run a specific test file or a project:**

   ```bash
   npx playwright test tests/desktop-booking.spec.ts
   npx playwright test --project=Desktop
   npx playwright test --project=Mobile

## Project Structure

- `tests/desktop-booking.spec.ts and tests/mobile-booking.spec.ts`: Main E2E test file for the booking flow
- `pages/`: Page Object Models (POM)
    - `HomePage.ts`: Homepage interactions
    - `CheckoutPage.ts`: Checkout page interactions
    - `PaymentPage.ts`: Payment page interactions
- `playwright.config.ts`: Playwright configuration
- `package.json`: Project dependencies and scripts
