import {test, expect} from '@playwright/test';
import {HomePage} from '../pages/HomePage';
import {CheckoutPage} from '../pages/CheckoutPage';
import {PaymentPage} from '../pages/paymentPage';
import {faker} from '@faker-js/faker';

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const user = {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    mobile: '1234567890'
};

// ideally, this should be in a config file or environment variable, placed it here so no need to set up env before running the test
// but in a real-world scenario, you would want to keep sensitive data like card details out of your codebase
const cardDetails = {
    cardNumber: '4917610000000000',
    expiryDate: '03/30',
    securityCode: '737',
    cardHolder: user.firstName
};


test('Desktop Booking Flow', async ({page}) => {
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);

    // Navigate to homepage
    await homePage.navigate();
    await homePage.verifyCartEmpty(); // verify cart is 0 when we start
    const {fromDate, toDate} = await homePage.selectDateRange();
    await homePage.searchRooms();
    await homePage.validateRooms();
    await homePage.selectSuiteRate('Deluxe King', 'Bed & Breakfast');

    // Cart Flow
    await homePage.waitForCartVisible()
    await homePage.expectCartItemTitle('Deluxe King')
    await homePage.validateCartContent();
    await homePage.validateCartDates(fromDate, toDate);
    await homePage.clickCheckout();

    // Checkout Flow
    await checkoutPage.validateCheckoutCartDates(fromDate, toDate); // Validate checkout cart dates (ensure they match the cart details)
    await checkoutPage.validateBookingDetails(); // Validate booking details (ensure guests, duration, rates, and total are visible)
    const {totalAmount, downpayment, balance} = await checkoutPage.calculatePayment();  // Calculate payment (down payment and balance)
    console.log(`Total: ${totalAmount}, Downpayment: ${downpayment}, Balance: ${balance}`);

    const fullName = `${user.firstName} ${user.lastName}`;
    await checkoutPage.fillBookingForm(user);
    await checkoutPage.fillCardDetails(cardDetails);
    await checkoutPage.validateAndClickPayButton(downpayment);  // Validate and click the Pay button (check that down payment text matches)

    // Payment Page Flow
    await paymentPage.validateGuestDetails(page, {fullName, email: user.email, mobile: user.mobile});
    await paymentPage.validatePayments(balance, downpayment, totalAmount);
    await paymentPage.validateSuiteType('Deluxe King');
    await paymentPage.validateReservationDates(page, fromDate, toDate);

});
