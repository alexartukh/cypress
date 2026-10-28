export class HomePage {
    readonly url: string = '/';

    readonly languageButton: string = 'button#language';
    readonly cards: string = 'a.card';
    readonly oosSection: string = '[data-test="out-of-stock"]';
    readonly searchInput: string = '#search-query';
    readonly searchButton: string = 'button[data-test="search-submit"]';
    readonly nextPageSelector: string = '#quantity-input';

    searchFor(str: string) {
        cy.intercept('GET', '**/products/search**').as('search');
        cy.get(this.searchInput).clear().type(str);
        cy.get(this.searchButton).click();
        cy.wait('@search'); // ждём ответ с именем 'search'
    }

    searchForSomethingButOOS(str: string) {
        // 1. перехват ставим ДО клика; times: 1 — сработает один раз и снимется сам
        const routeMatcher = {
            url: '**/products/search**',
            times: 1,                                   // как { times: 1 } в Playwright
        };

        cy.intercept(routeMatcher, function (req) {
            // req.continue() отправляет запрос на настоящий сервер (как route.fetch())
            req.continue(function (res) {
                // res.body уже распарсен из JSON (как await response.json())
                res.body.data.forEach(function (p: any) {
                    p.in_stock = false;
                });
                // всё, что изменено в res.body, браузер получит сам (как route.fulfill)
            });
        }).as('search');

        // 2. действия
        cy.get(this.searchInput).clear().type(str);
        cy.get(this.searchButton).click();

        // 3. ждём подменённый ответ
        cy.wait('@search', { timeout: 5000 });
    }

    goHomeAndUseFirstAvailableProduct() {
        cy.visit(this.url);
        cy.get(this.cards).not(`:has(${this.oosSection})`).first().click();
        cy.get(this.nextPageSelector).should('be.visible');
    }

    getOOSProductTiles() {
        return cy.get(this.cards).filter(`:has(${this.oosSection})`);
    }

    selectLanguage(lang: string) {
        cy.visit(this.url);
        cy.get(this.languageButton).click();
        cy.get(`a[data-test="lang-${lang}"]`).should('be.visible');
        cy.get(`a[data-test="lang-${lang}"]`).click();
    }
}