import {Locator, Page} from '@playwright/test';
import {expect} from '@playwright/test';
import {faker} from '@faker-js/faker';
import {formatDate} from '../utils/helper';

export class CheckoutPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Page Elements (locators)
    private pageElements = {
        cartCheckin: 'cart-breakdown-checkin-1',
        cartCheckout: 'cart-breakdown-checkout-1',
        cartGuests: 'cart-breakdown-guests-1',
        cartDuration: 'cart-breakdown-duration-1',
        cartRates: 'cart-breakdown-rates-1',
        cartTotal: 'cart-breakdown-total',
        paymentButton: 'pay-btn-summary',
        bookingFormFirstName: 'booking-summary-form-first-name',
        bookingFormLastName: 'booking-summary-form-last-name',
        bookingFormEmail: 'booking-summary-form-email',
        bookingFormMobile: 'booking-summary-form-mobile',
        bookingFormAddress: 'booking-summary-form-address',
        cardNumberFrame: '[title="Iframe for card number"]',
        cardExpiryFrame: '[title="Iframe for expiry date"]',
        cardSecurityFrame: '[title="Iframe for security code"]',
        cardHolderName: '[id^="adyen-checkout-holderName"]',
        addressFinderOption: '[id^="address-finder-option"]',
        cardNumberInput: '[id^="adyen-checkout-encryptedCardNumber"]',
        cardExpiryInput: '[id^="adyen-checkout-encryptedExpiryDate"]',
        cardSecurityInput: '[id^="adyen-checkout-encryptedSecurityCode"]',

        mobile: {
            checkIn: 'cart-item-checkin-1',
            checkout: 'cart-item-checkout-1',
            cartTotal: 'cart-item-rates-1'
        }
    };

    // Validate cart dates on the checkout page
    async validateCheckoutCartDates(checkInDate: Date, checkOutDate: Date, isMobile?: boolean) {
        let checkInLocator: Locator, checkOutLocator: Locator;
        const expectedCheckIn = formatDate(checkInDate, {weekday: 'short', month: 'short', year: null});
        const expectedCheckOut = formatDate(checkOutDate, {weekday: 'short', month: 'short', year: null});

        if (isMobile) {
            checkInLocator = this.page.getByTestId(this.pageElements.mobile.checkIn);
            checkOutLocator = this.page.getByTestId(this.pageElements.mobile.checkout);
        } else {
            checkInLocator = this.page.getByTestId(this.pageElements.cartCheckin);
            checkOutLocator = this.page.getByTestId(this.pageElements.cartCheckout);
        }

        await expect(checkInLocator).toContainText(expectedCheckIn);
        await expect(checkOutLocator).toContainText(expectedCheckOut);
    }

    // Validate booking details on the checkout page
    async validateBookingDetails() {
        await expect(this.page.getByTestId(this.pageElements.cartGuests)).toBeVisible();
        await expect(this.page.getByTestId(this.pageElements.cartDuration)).toBeVisible();
        await expect(this.page.getByTestId(this.pageElements.cartRates)).toBeVisible();
        await expect(this.page.getByTestId(this.pageElements.cartTotal)).toBeVisible();
    }

    // Calculate payment details
    async calculatePayment(isMobile?: boolean) {
        const totalAmount = await this.getTotalAmount(isMobile);
        const downpayment = totalAmount * 0.10;
        const balance = totalAmount - downpayment;
        return {totalAmount, downpayment, balance};
    }

    // Fill the booking form with user details
    async fillBookingForm(user: { firstName: string, lastName: string, email: string, mobile: string }) {

        const firstName = this.page.getByTestId(this.pageElements.bookingFormFirstName).locator('input');
        const lastName = this.page.getByTestId(this.pageElements.bookingFormLastName).locator('input');
        const email = this.page.getByTestId(this.pageElements.bookingFormEmail).locator('input');
        const mobile = this.page.getByTestId(this.pageElements.bookingFormMobile).locator('input');
        const address = this.page.getByTestId(this.pageElements.bookingFormAddress).locator('input');
        const addressOption = this.page.locator(this.pageElements.addressFinderOption).first();

        await firstName.waitFor({state: 'attached'});
        await lastName.waitFor({state: 'attached'});
        await email.waitFor({state: 'attached'});
        await mobile.waitFor({state: 'attached'});
        await address.waitFor({state: 'attached'});


        await firstName.fill(user.firstName);
        await lastName.fill(user.lastName);
        await email.fill(user.email);
        await mobile.fill(user.mobile);
        await address.fill('Melbourne');
        await addressOption.waitFor({state: 'attached'});
        await addressOption.click();
    }

    // Fill the card details on the checkout page
    async fillCardDetails(cardDetails: {
        cardNumber: string,
        expiryDate: string,
        securityCode: string,
        cardHolder: string
    }) {
        await this.page.locator(this.pageElements.cardNumberFrame)
            .first().contentFrame()
            .locator(this.pageElements.cardNumberInput)
            .first().fill(cardDetails.cardNumber);

        await this.page.locator(this.pageElements.cardExpiryFrame)
            .first().contentFrame()
            .locator(this.pageElements.cardExpiryInput)
            .first().fill(cardDetails.expiryDate);

        await this.page.locator(this.pageElements.cardSecurityFrame)
            .first().contentFrame()
            .locator(this.pageElements.cardSecurityInput)
            .first().fill(cardDetails.securityCode);

        await this.page.locator(this.pageElements.cardHolderName)
            .first().fill(cardDetails.cardHolder);
    }

    // Validate and click the pay button
    async validateAndClickPayButton(downpayment: number) {
        const downpaymentText = `AUD $${downpayment.toFixed(2)}`.replace('.00', ''); // Remove ".00" if it exists
        const payButton = this.page.getByTestId(this.pageElements.paymentButton);
        const buttonText = await payButton.textContent();

        if (buttonText && buttonText.includes(downpaymentText)) {
            await payButton.click();
        } else {
            throw new Error(`Button text does not match the expected downpayment. Expected: ${downpaymentText}, but found: ${buttonText}`);
        }
    }

    // Utility function to get the total amount
    private async getTotalAmount(isMobile?: boolean): Promise<number> {
        let totalAmountLocator: Locator;
        if (isMobile) {
            totalAmountLocator = this.page.getByTestId(this.pageElements.mobile.cartTotal);
        } else {
            totalAmountLocator = this.page.getByTestId(this.pageElements.cartTotal);
        }

        const totalText = await totalAmountLocator.textContent();
        const totalAmount = parseFloat(totalText.replace('AUD $', '').replace(',', ''));
        return totalAmount;
    }
}