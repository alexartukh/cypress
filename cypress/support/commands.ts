// cypress/support/commands.ts
/// <reference types="cypress" />
import { getRandomEmail } from './utils';

export interface User {
    email: string;
    password: string;
}

// говорим TypeScript, что у cy появилась новая команда
declare global {
    namespace Cypress {
        interface Chainable {
            registerUser(): Chainable<User>;
            loginByApi(): Chainable<User>;
        }
    }
}

Cypress.Commands.add('registerUser', function () {
    const user: User = { email: getRandomEmail(), password: 'wordPASS123!' };

    const requestOptions = {
        method: 'POST',
        url: 'https://api.practicesoftwaretesting.com/users/register',
        body: {
            first_name: 'Alex',
            last_name: 'Artukh',
            dob: '1983-04-23',
            phone: '601267',
            email: user.email,
            password: user.password,
            address: { street: 'Broadway', city: 'Chicago', state: 'Illinois', country: 'US', postal_code: '60601' },
        },
    };

    cy.request(requestOptions).then(function (response) {
        expect(response.status).to.equal(201);
    });

    return cy.wrap(user); // следующий .then() получит user
});

Cypress.Commands.add('loginByApi', function () {
    // 1. регистрируем нового юзера (как зависимость от registeredUser)
    return cy.registerUser().then(function (user) {

        // 2. логин через API
        const requestOptions = {
            method: 'POST',
            url: 'https://api.practicesoftwaretesting.com/users/login',
            body: {
                email: user.email,
                password: user.password,
            },
        };

        cy.request(requestOptions).then(function (response) {
            expect(response.status).to.equal(200);
            const accessToken: string = response.body.access_token;

            // 3. кладём токен в localStorage ДО загрузки страницы (как addInitScript)
            const visitOptions = {
                onBeforeLoad: function (win: Window) {
                    win.localStorage.setItem('auth-token', accessToken);
                },
            };
            cy.visit('/', visitOptions);
        });

        // 4. следующий .then() получит user
        return cy.wrap(user);
    });
});