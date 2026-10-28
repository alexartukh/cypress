export class BillingAddressPage {
    readonly country: string = 'select#country';
    readonly postalCode: string = 'input#postal_code';
    readonly houseNumber: string = 'input#house_number';
    readonly proceed: string = 'button[data-test="proceed-3"]';
    readonly nextPageSelector: string = 'select#payment-method';

    fillAddress(country: string, postcode: string, house: string) {
        // 1. ставим ожидание ДО действий (как const lookup = ... в Playwright)
        const routeMatcher = {
            url: /\/postcode-lookup/,          // как r.url().includes('/postcode-lookup')
            query: { postcode: postcode },     // как r.url().includes(`postcode=${postcode}`)
        };
        cy.intercept(routeMatcher).as('lookup');

        cy.get(this.country).select(country);
        cy.get(this.postalCode).clear().type(postcode);
        cy.get(this.houseNumber).clear().type(house);

        cy.wait('@lookup', { timeout: 10000 });
    }

    continue() {
        cy.get(this.proceed).should('be.enabled');
        cy.get(this.proceed).click();
        cy.get(this.nextPageSelector).should('be.visible');
    }
}