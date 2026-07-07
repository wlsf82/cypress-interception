Cypress.Commands.add('assertLoadingIsShownAndHidden', () => {
  cy.contains('p', 'Loading ...').should('be.visible')
  cy.contains('p', 'Loading ...').should('not.exist')
})
