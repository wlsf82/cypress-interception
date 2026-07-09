Cypress.Commands.add('assertSearchInLocalStorage', term => {
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'search')
    .should('be.equal', term)
})
