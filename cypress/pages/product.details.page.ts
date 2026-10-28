export class ProductDetailsPage {
    readonly addToCartButton: string = 'button#btn-add-to-cart';
    readonly cartCounter: string = 'span#lblCartCount';
    readonly nextPageSelector: string = 'aw-wizard-navigation-bar';

    addToEmptyCartWithDefaultQuantity() {
        cy.get(this.addToCartButton).click();
        cy.get(this.cartCounter).should('have.text', '1');
    }

    addToNonEmptyCartWithDefaultQuantity(expectedAmount:string) {
        cy.get(this.addToCartButton).click();
        cy.get(this.cartCounter).should('have.text', expectedAmount);
    }

    goToCartViaHeader() {
        cy.get(this.cartCounter).click();
        cy.get(this.nextPageSelector).should('be.visible');
    }
}