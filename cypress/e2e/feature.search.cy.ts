import { TAGS } from '../support/tags';
import { HomePage } from '../pages/home.page';

describe('search from a home page', { tags: TAGS.smoke }, function () {

    const homePage = new HomePage();

    // параметры для групп тестов
    const searchCases = [
        { param: 'Combination Pliers', expectedResult: 1 },
        { param: 'Pliers', expectedResult: 4 },
        { param: '111111111111', expectedResult: 0 },
    ];

    beforeEach(function () {
        const lang: string = Cypress.expose('lang'); // 'en' из конфига или из --expose lang=de
        homePage.selectLanguage(lang);
    });


    for (const searchCase of searchCases) {
        it(`search for "${searchCase.param}"`, function () {
            homePage.searchFor(searchCase.param);
            cy.get(homePage.cards).should('have.length', searchCase.expectedResult);
        });
    }

    //     // вторая группа параметризированных тестов
    //     for (const searchCase of searchCases) {
    //         test(`search for "${searchCase.param}" but everything is OOS`, async ({ homePage }) => {
    //             await homePage.searchForSomethingButOOS(searchCase.param);
    //             await expect(homePage.cards).toHaveCount(searchCase.expectedResult);
    //             await expect(homePage.getOOSProductTiles()).toHaveCount(searchCase.expectedResult);
    //         });
    //     }
});