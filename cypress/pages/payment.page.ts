export class PaymentPage {
    readonly paymentMethod: string = 'select#payment-method';
    readonly ccNumber: string = 'input#credit_card_number';
    readonly expiration: string = 'input#expiration_date';
    readonly cvv: string = 'input#cvv';
    readonly holder: string = 'input#card_holder_name';
    readonly finishButton: string = 'button[data-test="finish"]';
    readonly successMessage: string = 'div[data-test="payment-success-message"]';
    readonly nextPageSelector: string = 'div#order-confirmation';

    useCC(ccNumber:string, expiration:string, cvv:string, holder:string) {
        cy.get(this.paymentMethod).select('credit-card');
        cy.get(this.ccNumber).type(ccNumber);
        cy.get(this.expiration).type(expiration);
        cy.get(this.cvv).type(cvv);
        cy.get(this.holder).type(holder);
        cy.get(this.finishButton).click();
        cy.get(this.successMessage, { timeout: 15000 }).should('be.visible');
    }

    placeOrder() {
        cy.get(this.finishButton).click();
        cy.get(this.nextPageSelector).should('be.visible');
    }
    
}