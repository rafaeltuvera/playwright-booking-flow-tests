import {Page, Locator} from '@playwright/test';
import {expect} from '@playwright/test';
import {formatDate} from '../utils/helper';

export class PaymentPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Page Elements (locators)
    private pageElements = {
        guestName: 'booking-confirmation-Name',
        guestEmail: 'booking-confirmation-Email-1',
        guestMobile: 'booking-confirmation-Mobile Number-2',
        confirmationCategoryTitle: 'confirmation-category-title',
        depositAmount: 'booking-confirmation-deposit',
        outstandingPaymentAmount: 'booking-confirmation-outstanding-payment',
        totalAmount: 'booking-confirmation-Total',
        bookingConfirmationCheckIn: 'booking-confirmation-Check-in',
        bookingConfirmationCheckOut: 'booking-confirmation-Check-out',
    };

    // Validate Guest Details
    async validateGuestDetails(page: Page, user: {
        fullName: string,
        email: string,
        mobile: string
    }): Promise<void> {
        // Validate Name
        const nameLocator = page.locator(`[data-testid^="${this.pageElements.guestName}"]`);
        const nameText = await nameLocator.textContent();
        if (nameText?.trim() !== user.fullName) {
            throw new Error(`Name mismatch. Expected: ${user.fullName}, but found: ${nameText?.trim()}`);
        }

        // Validate Email
        const emailLocator = page.getByTestId(this.pageElements.guestEmail);
        const emailText = await emailLocator.textContent();
        if (emailText?.trim() !== user.email) {
            throw new Error(`Email mismatch. Expected: ${user.email}, but found: ${emailText?.trim()}`);
        }

        // Validate Mobile Number
        const mobileLocator = page.getByTestId(this.pageElements.guestMobile);
        const mobileText = await mobileLocator.textContent();
        if (mobileText?.trim() !== user.mobile) {
            throw new Error(`Mobile Number mismatch. Expected: ${user.mobile}, but found: ${mobileText?.trim()}`);
        }

        console.log("Guest details validated successfully!");
    }

    // Validate Payments
    async validatePayments(balance: number, downpayment: number, totalAmount: number): Promise<void> {
        // Get the text content for Paid Today and Outstanding Payment
        const paidTodayText = await this.page.getByTestId(this.pageElements.depositAmount).textContent();
        const outstandingPaymentText = await this.page.getByTestId(this.pageElements.outstandingPaymentAmount).textContent();
        const totalText = await this.page.locator(`[data-testid^="${this.pageElements.totalAmount}"]`).textContent();

        // Clean the text to remove "Deposit" and "AUD $" from the values
        const paidToday = parseFloat(paidTodayText?.replace(/[^0-9.-]+/g, '') ?? '0');
        const outstandingPayment = parseFloat(outstandingPaymentText?.replace(/[^0-9.-]+/g, '') ?? '0');
        const total = parseFloat(totalText?.replace(/[^0-9.-]+/g, '') ?? '0');

        // Validate that the paidToday is equal to the downpayment
        expect(paidToday).toBe(downpayment);

        // Validate that the outstandingPayment is equal to the balance minus the downpayment
        expect(outstandingPayment).toBe(balance);

        // Validate the total amount is the sum of paidToday and outstandingPayment
        const calculatedTotal = paidToday + outstandingPayment;
        expect(calculatedTotal).toBe(totalAmount);

        console.log("Payment details validated successfully!");
    }

    async validateSuiteType(suiteType: string): Promise<void> {
        const confirmationTitle = this.page.locator(`[data-id^="${this.pageElements.confirmationCategoryTitle}"]`);
        await expect(confirmationTitle).toHaveText(suiteType);
    }


    async validateReservationDates(page, checkInDate: Date, checkOutDate: Date) {
        const expectedCheckIn = formatDate(checkInDate, {weekday: 'short', month: 'short'});
        const expectedCheckOut = formatDate(checkOutDate, {weekday: 'short', month: 'short'});

        const checkInText = await page.locator(`[data-testid^="${this.pageElements.bookingConfirmationCheckIn}"]`).textContent();
        const checkOutText = await page.locator(`[data-testid^="${this.pageElements.bookingConfirmationCheckOut}"]`).textContent();

        // Convert the text content to Date objects
        const checkInDateObj = new Date(checkInText.trim());
        const checkOutDateObj = new Date(checkOutText.trim());

        // Format the check-in date as "Sat, MMM D YYYY"
        const formattedCheckIn = checkInDateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        // Format the check-outdate as "Sat, MMM D YYYY"
        const formattedCheckOut = checkOutDateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        expect(formattedCheckIn).toBe(expectedCheckIn);
        expect(formattedCheckOut).toBe(expectedCheckOut);
    }
}
