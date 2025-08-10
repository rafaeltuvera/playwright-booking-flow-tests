import { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { formatDate } from '../utils/helper';

// HomePage Class
export class HomePage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Page Elements (locators)
    private pageElements = {
        cartButton: 'btnShowCart',
        calendarIcon: 'CalendarMonthOutlinedIcon',
        searchButton: 'search',
        roomItem: /^roomItem/,
        seePricesButton: 'see-prices-btn-rates-page',
        cartComponent: 'cartContentComponent',
        cartItemTitle: 'cart-item-title-1',
        checkoutButton: 'btnCheckoutOnCart',
        adultsValue: 'adults-value',
        childrenValue: 'children-value',
        infantsValue: 'infants-value',
        cartItemDuration: 'cart-item-duration-1',
        cartItemRates: 'cart-item-rates-1',
        cartItemRemove: 'cart-item-remove-room-1',
        cartCheckin: 'cart-item-checkin-1',
        cartCheckout: 'cart-item-checkout-1',
        roomPriceListItem: 'room-price-list-item',
        priceTitle: 'price-title',
        addToCartButton: 'add-to-cart-btn-rates-page', // Added here
    };

    // Navigate to homepage
    async navigate() {
        await this.page.goto('/22749/1');
    }

    // Check if the cart shows the correct number
    async verifyCartEmpty() {
        const cart = this.page.getByTestId(this.pageElements.cartButton);
        await expect(cart).toHaveText(/0/);
    }

    // Click Calendar and Select Date Range
    async selectDateRange() {
        await this.page.getByTestId(this.pageElements.calendarIcon).click();
        return await this.clickDateRange();
    }

    // Perform a room search
    async searchRooms() {
        await this.page.getByTestId(this.pageElements.searchButton).click();
    }

    // Validate rooms appear in search results
    async validateRooms() {
        const roomItems = this.page.getByTestId(this.pageElements.roomItem);
        const count = await roomItems.count();
        expect(count).toBeGreaterThan(0);
    }

    // Validate cart content visibility
    async validateCartContent() {
        const cart = this.page.getByTestId(this.pageElements.cartComponent);
        await expect(cart.getByTestId(this.pageElements.adultsValue)).toBeVisible();
        await expect(cart.getByTestId(this.pageElements.childrenValue)).toBeVisible();
        await expect(cart.getByTestId(this.pageElements.infantsValue)).toBeVisible();
        await expect(cart.getByTestId(this.pageElements.cartItemDuration)).toBeVisible();
        await expect(cart.getByTestId(this.pageElements.cartItemRates)).toBeVisible();
        await expect(cart.getByTestId(this.pageElements.cartItemRemove)).toBeVisible();
    }

    // Validate cart dates
    async validateCartDates(fromDate: Date, toDate: Date) {
        const expectedCheckIn = formatDate(fromDate, { weekday: 'short', month: 'short' });
        const expectedCheckOut = formatDate(toDate, { weekday: 'short', month: 'short' });

        const checkInLocator = this.page.getByTestId(this.pageElements.cartCheckin);
        const checkOutLocator = this.page.getByTestId(this.pageElements.cartCheckout);

        await expect(checkInLocator).toHaveText(expectedCheckIn);
        await expect(checkOutLocator).toHaveText(expectedCheckOut);
    }

    // Click checkout
    async clickCheckout() {
        const checkoutButton = this.page.getByTestId(this.pageElements.checkoutButton);
        await checkoutButton.click();
    }

    // Utility function to handle selecting dates
    private async clickDateRange(dates?: { fromDateFormatted: string; toDateFormatted: string }) {
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() + 3);
        const toDate = new Date(today);
        toDate.setDate(today.getDate() + 4);

        const fromLocator = this.page.locator(`div[aria-label="${formatDate(fromDate)}"]:not(.disabled)`);
        if (await fromLocator.count() > 0) {
            await fromLocator.first().click();
        } else {
            console.warn(`From date "${formatDate(fromDate)}" is disabled or not found.`);
        }

        const toLocator = this.page.locator(`div[aria-label="${formatDate(toDate)}"]:not(.disabled)`);
        if (await toLocator.count() > 0) {
            await toLocator.first().click();
        } else {
            console.warn(`To date "${formatDate(toDate)}" is disabled or not found.`);
        }

        return { fromDate, toDate };
    }

    // Select Suite Rate Method
    async selectSuiteRate(
        suiteType: 'Family Suite' | 'Deluxe King',
        rateType: 'Bed & Breakfast' | 'Best Available Rate'
    ) {

        await this.page.getByTestId(this.pageElements.seePricesButton).first().click();
        //  Find the "Suite" room section
        const suite = this.page.getByTestId(this.pageElements.roomItem).filter({ hasText: suiteType });
        const container = suite.locator('..').locator('..').locator('..').locator('..'); // Navigate to the correct parent container

        // Within that room, find the correct rate block by title (e.g., Bed & Breakfast or Best Available Rate)
        const rate = container
            .getByTestId(this.pageElements.roomPriceListItem)
            .filter({ has: this.page.getByTestId(this.pageElements.priceTitle).filter({ hasText: rateType }) });

        // Click the "Add to Cart" button for the selected rate
        await rate.getByTestId(this.pageElements.addToCartButton).first().click();
    }
}