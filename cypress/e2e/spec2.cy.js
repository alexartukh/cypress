describe('Place an order', () => {

  it('Place an order as a logged in user', () => {

    cy.task('sumNumbers', {a: 2, b: 5}).then((result) => {
      cy.log(result)
    })

    cy.visit('https://std131001.test/')
    cy.get('a[title="Konto"]').click()
    //
    cy.url().should('include', 'Mein-Konto')
    cy.get('input[name="kd_mail"]').type('alex@example.com')
    cy.get('input[name="kd_pwd"]').type('123')
    cy.get('input.loginBtn').click()
    //
    cy.get('body', { timeout: 10000 }).should('contain', 'Bestellungen einsehen')
    cy.visit('https://std131001.test/')
    cy.get('a[title="p1"]').first().click()
    //
    cy.get('body', { timeout: 10000 }).should('contain', 'In den Warenkorb')
    cy.get('input[value="In den Warenkorb"]').click()
    //
    cy.get('a[title="zum Warenkorb"]', { timeout: 10000 }).should('be.visible')
    cy.visit('https://std131001.test/Warenkorb')
    cy.get('#dhl_agree_checkbox').check()
    cy.get('input[name="button_submit"]').should('be.visible').click()
    //
    cy.url({ timeout: 10000 }).should('include', 'Adresseingabe')
    cy.get('input[name="button_submit"]').should('be.visible').click()
    //
    cy.url({ timeout: 10000 }).should('include', 'Zahlung+Versand')
    cy.get('input[name="bestagb"]').check()
    cy.get('input[name="button_submit"]').should('be.visible').click()
    //
    cy.url({ timeout: 10000 }).should('include', 'Kontrolle')
    cy.get('input[value="zahlungspflichtig bestellen"]').should('be.visible').click()
    //
    cy.get('body', { timeout: 10000 }).should('contain', 'Vielen Dank für Ihre Bestellung')

    cy.get('h5[role="heading"]').then( ($heading) => {
      const headingText = $heading.text()
      let m = headingText.match(/\d+$/)      
      let orderNumber = m[0]

      cy.log('Номер заказа:', orderNumber)

      // async task
      cy.task('checkOrderNumber', orderNumber).then((result) => {
        cy.log(result)
        expect(result.auftragsnr).to.equal(orderNumber);
      })

    })

  })
})