import { faker } from '@faker-js/faker/locale/en'

describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Hitting the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: { query: 'React', page: '0' }
      }).as('getStories')
      cy.visit('/')
      cy.wait('@getStories')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: { query: initialTerm, page: '1' }
      }).as('getNextStories')

      cy.get('.item')
        .should('have.length', 20)
        .and('be.visible')

      cy.contains('button', 'More').click()

      cy.wait('@getNextStories')

      cy.get('.item')
        .should('have.length', 40)
        .and('be.visible')
    })

    it('searches via the last searched term', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: { query: newTerm, page: '0' }
      }).as('getNewTermStories')

      cy.get('#search').clear()
      cy.get('#search').type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.contains('button', initialTerm).click()

      cy.wait('@getStories')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', initialTerm)
        .and('be.visible')
      cy.contains('button', newTerm)
        .should('be.visible')
    })
  })

  context('Mocking the API', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getMockedStories')
        cy.visit('/')
        cy.wait('@getMockedStories')
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        const stories = require('../fixtures/stories')

        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('be.visible')
            .and('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('shows one story less after dismissing the first one', () => {
          cy.get('.button-small')
            .first()
            .click()

          cy.get('.item').should('have.length', 1)
        })

        context('Order by', () => {
          it('orders by title', () => {
            cy.contains('.list-header-button', 'Title')
              .as('titleHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)
            cy.contains('.item a', stories.hits[0].title)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@titleHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)
          })

          it('orders by author', () => {
            cy.contains('.list-header-button', 'Author')
              .as('authorHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)

            cy.get('@authorHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].author)
          })

          it('orders by comments', () => {
            cy.contains('.list-header-button', 'Comments')
              .as('commentsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments)

            cy.get('@commentsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)
          })

          it('orders by points', () => {
            cy.contains('.list-header-button', 'Points')
              .as('pointsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].points)

            cy.get('@pointsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)
          })
        })
      })
    })

    context('Search', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'empty' }
        ).as('getEmpty')

        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getNewTermMockedStories')

        cy.visit('/')
        cy.wait('@getEmpty')

        cy.get('#search').clear()
      })

      it('shows no story when none is returned', () => {
        cy.get('.item').should('not.exist')
      })

      it('searches for a term by typing and hitting ENTER', () => {
        cy.get('#search').type(`${newTerm}{enter}`)

        cy.wait('@getNewTermMockedStories')

        cy.get('.item')
          .should('have.length', 2)
          .and('be.visible')
        cy.contains('button', initialTerm)
          .should('be.visible')
      })

      it('searches for a term by typing and clicking the submit button', () => {
        cy.get('#search').type(newTerm)
        cy.contains('button', 'Submit').click()

        cy.wait('@getNewTermMockedStories')

        cy.get('.item')
          .should('have.length', 2)
          .and('be.visible')
        cy.contains('button', initialTerm)
          .should('be.visible')
      })

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          cy.intercept(
            'GET',
            '**/search?query=**',
            { fixture: 'empty' }
          ).as('getRandomStories')

          Cypress._.times(6, () => {
            const randomTerm = faker.hacker.noun()

            cy.get('#search')
              .clear()
              .type(`${randomTerm}{enter}`)
            cy.wait('@getRandomStories')
          })

          cy.get('.last-searches')
            .find('button')
            .should('have.length', 5)
            .and('be.visible')
        })
      })
    })
  })
})

describe('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 }
    ).as('getServerFailure')

    cy.visit('/')
    cy.wait('@getServerFailure')

    cy.contains('p', 'Something went wrong ...')
      .should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 }
    ).as('getNetworkFailure')

    cy.visit('/')
    cy.wait('@getNetworkFailure')

    cy.contains('p', 'Something went wrong ...')
      .should('be.visible')
  })
})

describe('Loading State', () => {
  it('shows a "Loading ..." state before showing the results', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        delay: 1000,
        fixture: 'stories'
      }
    ).as('getDelayedStories')

    cy.visit('/')

    cy.contains('p', 'Loading ...').should('be.visible')

    cy.wait('@getDelayedStories')

    cy.contains('p', 'Loading ...').should('not.exist')
    cy.get('.item').should('have.length', 2)
  })
})
