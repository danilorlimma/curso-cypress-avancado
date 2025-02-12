describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'
  context('Htting the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStories')
      cy.visit('/')
      cy.wait('@getStories')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '1'
        }
      }).as('getNextStories')
      cy.get('.item').should('have.length', 20)

      cy.contains('More')
        .should('be.visible')
        .click()

      cy.wait('@getNextStories')

      cy.get('.item').should('have.length', 40)
    })
    it('searches via the last searched term', () => {
      cy.intercept('GET', `**/search?query=${newTerm}&page=0`).as('getNewTermStories')

      cy.get('#search')
        .should('be.visible')
        .clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.getLocalStorage('search')
        .should('be.equal', newTerm)

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.getLocalStorage('search')
        .should('be.equal', initialTerm)

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })
  context('Mocking the API', () => {
    const stories = require('../fixtures/stories.json')
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getStories')
      })

      it.skip('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I assert on the data?
        // This is why this test is being skipped.
        // TODO: Find a way to test it out.
        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('be.visible')
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)

          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)
          // cy.contains('.item a', stories.hits[0].title)
          // .should('have.attr', 'href', stories.hits[0].url);

          cy.get('.item')
            .last()
            .should('be.visible')
            .should('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)

          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('shows one less story after dimissing the first one', () => {
          const lessTimes = stories.hits.length - 1
          Cypress._.times(lessTimes, () => {
            cy.get('.button-small')
              .first()
              .should('be.visible')
              .click()
          })

          cy.get('.item').should('have.length', stories.hits.length - lessTimes)
        })

        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context('Order by', () => {
          it('orders by title', () => {
            cy.get('button:contains(Title)')
              .as('titleOrder')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .as('firstItem')
              .should('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@titleOrder')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .as('firstItem')
              .should('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)
          })

          it('orders by author', () => {
            cy.get('button:contains(Author)')
              .as('authorOrder')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .as('firstItem')
              .should('contain', stories.hits[0].author)

            cy.get('@authorOrder')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .as('firstItem')
              .should('contain', stories.hits[1].author)
          })

          it('orders by comments', () => {
            cy.get('button:contains(Comments)')
              .as('commentsOrder')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .as('firstItem')
              .should('contain', stories.hits[1].num_comments)

            cy.get('@commentsOrder')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .as('firstItem')
              .should('contain', stories.hits[0].num_comments)
          })

          it('orders by points', () => {
            cy.get('button:contains(Points)')
              .as('pointsOrder')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .as('firstItem')
              .should('contain', stories.hits[0].points)

            cy.get('@pointsOrder')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .as('firstItem')
              .should('contain', stories.hits[1].points)
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
        ).as('getEmptyStories')

        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')

        // experimento inidividual - demonstra que o local storage está funcionando ao fazer requisição e
        // não somente na interação do usuário (neste caso funciona ao passar requisição)
        cy.getLocalStorage('search').should('be.equal', initialTerm)

        cy.get('#search')
          .should('be.visible')
          .clear()
      })

      it('shows no story when none is returned', () => {
        cy.get('.item')
          .should('not.exist')
      })

      it('types and hits ENTER', () => {
        cy.get('#search')
          .should('be.visible')
          .type(`${newTerm}{enter}`)
        cy.wait('@getStories')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get('.item').should('have.length', stories.hits.length)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .should('be.visible')
          .type(newTerm)
        cy.contains('Submit')
          .should('be.visible')
          .click()
        cy.wait('@getStories')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get('.item').should('have.length', stories.hits.length)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      context('Last searches', () => {
        Cypress._.times(2, () => {
          it('shows a max of 5 buttons for the last searched terms', () => {
            const faker = require('faker')
            cy.intercept(
              'GET',
              '**/search?query=**',
              {
                statusCode: 200,
                body: {
                  hits: []
                }
              }
            ).as('getRandomStories')

            Cypress._.times(6, () => {
              cy.get('#search')
                .clear()
                .type(`${faker.random.word()}{enter}`)
              cy.wait('@getRandomStories')
            })

            cy.get('.last-searches').within(() => {
              cy.get('button')
                .should('have.length', 5)
            })
          })
        })
      })
      // Hrm, how would I simulate such errors?
      // Since I still don't know, the tests are being skipped.
      // TODO: Find a way to test them out.
    })
  })
})

context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept('GET', '**/search**', { statusCode: 500 }).as('getServerFailure')
    cy.visit('/')
    cy.wait('@getServerFailure')
    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept('GET', '**/search**', { forceNetworkError: true }).as('getNetworkFailure')
    cy.visit('/')
    cy.wait('@getNetworkFailure')
    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible')
  })
})
