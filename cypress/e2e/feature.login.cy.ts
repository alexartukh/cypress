import { TAGS } from '../support/tags';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';

describe('login feature', { tags: TAGS.advanced }, function () {

    const homePage = new HomePage();
    const loginPage = new LoginPage();

    beforeEach(function () {
        const lang: string = Cypress.expose('lang'); // 'en' из конфига или из --expose lang=de
        homePage.selectLanguage(lang);
    });

    it('registration via API and login manually', function () {
        cy.registerUser().then(function (user) {
            const email: string = user.email;
            const password: string = user.password;

            cy.log(`login = ${email}, password = ${password}`);

            loginPage.login(email, password);
            cy.get(loginPage.getMyAccountProfileElement()).should('be.visible');
        });
    });

    it('registration and login via API', function () {
        cy.loginByApi();
        cy.visit('/account');
        cy.get(loginPage.getMyAccountProfileElement()).should('be.visible');
    });
});
