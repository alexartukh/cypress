import { TAGS } from '../support/tags';
import { HomePage } from '../pages/home.page';
import { ProductDetailsPage } from '../pages/product.details.page';

describe('cart calculations', { tags: TAGS.advanced }, function () {
    const homePage = new HomePage();
    const productDetailsPage = new ProductDetailsPage();

    beforeEach(function () {
        const lang: string = Cypress.expose('lang'); // 'en' из конфига или из --expose lang=de
        homePage.selectLanguage(lang);
    });

    // обычная функция, не cy-команда: значение возвращается сразу
    function parsePrice(text: string): number {
        const matchRes: RegExpMatchArray | null = text.trim().match(/^\$([\d.]+)$/);
        expect(matchRes, `cannot parse price "${text}"`).to.not.equal(null);   // Chai вместо not.toBeNull()
        return Number(matchRes![1]);
    }

    it('correct cart total', function () {
        homePage.searchFor('Hammer');
        cy.get(homePage.cards).first().click();
        productDetailsPage.addToEmptyCartWithDefaultQuantity();

        cy.visit(homePage.url);                             // page.goto → cy.visit
        homePage.searchFor('Hammer');
        cy.get(homePage.cards).eq(1).click();               // nth(1) → eq(1)
        productDetailsPage.addToNonEmptyCartWithDefaultQuantity('2');

        cy.visit(homePage.url);
        homePage.searchFor('Hammer');
        cy.get(homePage.cards).eq(2).click();
        productDetailsPage.addToNonEmptyCartWithDefaultQuantity('3');

        productDetailsPage.goToCartViaHeader();

        // как toHaveCount(3): ждёт, пока все три позиции появятся
        cy.get('app-cart tbody tr').should('have.length', 3);

        // 1. цены строк: в Playwright был цикл с await innerText(), здесь всё читается в одном .then()
        cy.get('app-cart tbody tr').then(function ($rows) {
            const rows: HTMLElement[] = $rows.toArray();    // jQuery → обычный массив DOM-элементов

            let aText: string = '';
            let sum: number = 0;
            for (let idx = 0; idx < rows.length; idx++) {
                const priceCell: HTMLElement | null = rows[idx].querySelector('td:nth-child(4)');
                const price: string = priceCell !== null ? (priceCell.textContent || '').trim() : '';
                aText += `${idx} = ${price}\n`;
                sum += parsePrice(price);
            }

            // 2. итог корзины: ещё одна команда, её значение — во вложенном .then()
            cy.get('app-cart tfoot tr td:nth-child(4)').invoke('text').then(function (total: string) {
                aText += '-------------\n';
                aText += `TOTAL = ${total.trim()}\n`;
                const sum2: number = parsePrice(total);

                cy.log(aText);                               // вместо makeAttachment: сначала данные…

                expect(sum2).to.be.closeTo(sum, 0.01);       // …потом проверка; toBeCloseTo(sum, 2) → closeTo(sum, 0.01)
            });
        });
    });
});
