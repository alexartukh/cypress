import { TAGS } from '../support/tags';
import { getRandomEmail } from '../support/utils';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { ProductDetailsPage } from '../pages/product.details.page';
import { BillingAddressPage } from '../pages/billing.address.page';
import { PaymentPage } from '../pages/payment.page';

describe('place order', function () {
    const homePage = new HomePage();
    const loginPage = new LoginPage();
    const productDetailsPage = new ProductDetailsPage();
    const billingPage = new BillingAddressPage();
    const paymentPage = new PaymentPage();

    beforeEach(function () {
        const lang: string = Cypress.expose('lang'); // 'en' из конфига или из --expose lang=de
        homePage.selectLanguage(lang);
    });

    it('place order as a registered user', { tags: TAGS.advanced }, function () {
        // обычные функции — значения сразу, .then() не нужен
        const email: string = getRandomEmail();
        const password: string = 'wordPASS123!';

        cy.log(`login = ${email}, password = ${password}`); // вместо makeAttachment

        // from login page to registration page
        cy.visit(loginPage.url);
        cy.get('a[data-test="register-link"]').click();
        cy.get('input#first_name').type('Alex');
        cy.get('input#last_name').type('Artukh');
        cy.get('input#dob').type('1983-04-23');
        cy.get('select#country').select('UA');                 // selectOption → select
        cy.get('input#postal_code').type('14034');
        cy.get('input#house_number').type('2');
        cy.get('input#street').type('Berezovskogo');
        cy.get('input#city').type('Chernihiv');
        cy.get('input#state').type('Chernihiv');
        cy.get('input#phone').type('601267');
        cy.get('input#email').type(email);
        cy.get('input#password').type(password);
        cy.get('[data-test="register-submit"]').click();
        cy.get('a[data-test="register-link"]').should('be.visible'); // вернулись на страницу логина

        // login page again
        loginPage.login(email, password);

        // home
        homePage.goHomeAndUseFirstAvailableProduct();

        // PDP
        productDetailsPage.addToEmptyCartWithDefaultQuantity();
        productDetailsPage.goToCartViaHeader();

        // cart
        cy.get('button[data-test="proceed-1"]').click();
        cy.get('[data-test="proceed-2"]').should('be.visible');

        // step 2 (login or guest)
        cy.get('[data-test="proceed-2"]').click();
        cy.get('[data-test="proceed-3"]').should('be.visible');

        // step 3 (billing address)
        billingPage.fillAddress('US', '60601', '100');
        billingPage.continue();

        // step 4 (payment)
        paymentPage.useCC('4111-1111-1111-1111', '12/2027', '123', 'ALEX ARTUKH');
        paymentPage.placeOrder();

        // Thanks for your order! Your invoice number is INV-2026000018.
        // innerText() → invoke('text'), значение приходит в .then()
        cy.get('div#order-confirmation').invoke('text').then(function (line) {
            cy.log(`Res = ${line}`);
        });
    });

    it('place order as a guest', { tags: TAGS.smoke }, function () {
        const email: string = getRandomEmail();

        cy.log(`login = ${email}`);

        // home
        homePage.goHomeAndUseFirstAvailableProduct();

        // PDP
        productDetailsPage.addToEmptyCartWithDefaultQuantity();
        productDetailsPage.goToCartViaHeader();

        // cart
        cy.get('button[data-test="proceed-1"]').click();
        cy.get('a[href="#guest-tab"]').should('be.visible');

        // step 2 (login or guest)
        cy.get('a[href="#guest-tab"]').click();
        cy.get('input#guest-last-name').should('be.visible');
        cy.get('input#guest-email').type(email);
        cy.get('input#guest-first-name').type('Alex');
        cy.get('input#guest-last-name').type('Artukh');
        cy.get('input[data-test="guest-submit"]').click();
        cy.get('[data-test="proceed-2-guest"]').should('be.visible');
        cy.get('[data-test="proceed-2-guest"]').click();
        cy.get('button[data-test="proceed-3"]').should('be.visible');

        // step 3 (billing address)
        billingPage.fillAddress('US', '60601', '100');
        billingPage.continue();

        // step 4 (payment)
        paymentPage.useCC('4111-1111-1111-1111', '12/2027', '123', 'ALEX ARTUKH');
        paymentPage.placeOrder();

        // Thanks for your order! Your invoice number is INV-2026000018.
        cy.get('div#order-confirmation').invoke('text').then(function (line) {
            cy.log(`Res = ${line}`);
        });
    });
});
