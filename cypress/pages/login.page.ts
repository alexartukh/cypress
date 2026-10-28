export class LoginPage {
    readonly url: string = '/auth/login';

    readonly loginInput: string = 'input#email';
    readonly passwordInput: string = 'input#password';
    readonly loginButton: string = 'input[data-test="login-submit"]';
    readonly nextPageElement: string = 'a[routerlink="profile"]';

    login(email:string, password:string) {
        cy.visit(this.url);
        cy.get(this.loginInput).type(email);
        cy.get(this.passwordInput).type(password);
        cy.get(this.loginButton).click();
        cy.get(this.nextPageElement).should('be.visible');
    }

    getMyAccountProfileElement() {
        return this.nextPageElement;
    }
}