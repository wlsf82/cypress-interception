Cypress.Commands.add('search', term => {
  cy.get('input[type="text"]')
    .should('be.visible')
    .clear()
    .type(`${term}{enter}`)
})

Cypress.Commands.add('assertSearchInLocalStorage', term => {
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'search')
    .should('be.equal', term)
})
