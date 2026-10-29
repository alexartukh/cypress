import { TAGS } from '../support/tags';
import { HomePage } from '../pages/home.page';
import { ProductDetailsPage } from '../pages/product.details.page';

describe('Screenshot tests', { tags: TAGS.screentest }, function () {
    const homePage = new HomePage();
    const productDetailsPage = new ProductDetailsPage();

    beforeEach(function () {
        const lang: string = Cypress.expose('lang'); // 'en' из конфига или из --expose lang=de
        homePage.selectLanguage(lang);
    });

    it('add to cart many times', function () {
        // home
        homePage.goHomeAndUseFirstAvailableProduct();

        // PDP
        productDetailsPage.addToEmptyCartWithDefaultQuantity();
        cy.wait(1500); // intentional: toasts must appear at different times to disappear one by one
        productDetailsPage.addToNonEmptyCartWithDefaultQuantity('2');

        // Если быстро добавлять продукты, то на экране будет несколько зеленых подтверждений в правом верхнем углу
        // нужно визуально проверить, что их там несколько
        const toastsSelector: string = 'div#toast-container div[role="alert"]';

        // их 2 одновременно
        cy.get(toastsSelector).should('have.length', 2);

        // В Playwright эталон хранился отдельно для каждого проекта (Chrome-EN, Firefox-DE...).
        // В Cypress проектов нет, поэтому браузер и язык добавляем в имя эталона сами.
        const lang: string = Cypress.expose('lang');
        const snapshotName: string = `toasts-stack-${Cypress.browser.name}-${lang}`;
        const snapshotOptions = {
            failureThreshold: 0.10,                // как maxDiffPixelRatio: 0.10
            failureThresholdType: 'percent' as const, // 0.10 — доля пикселей (10%), а не их количество
            // A 100% match does not work because each toast has a progress bar (animated)
        };
        cy.get('div#toast-container').matchImageSnapshot(snapshotName, snapshotOptions);

        // они исчезли по одному (плашка живёт несколько секунд, поэтому таймаут больше обычного)
        cy.get(toastsSelector, { timeout: 10000 }).should('have.length', 1);
        cy.get(toastsSelector, { timeout: 10000 }).should('have.length', 0);
    });
});
