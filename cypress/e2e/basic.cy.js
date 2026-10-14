describe('landing page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('shows the brand', () => {
    cy.get('h1').contains('Finest Form')
  })
  it('shows the waitlist form', () => {
    cy.get('input[type="email"]').should('be.visible')
    cy.get('button').contains('Stay informed')
  })
})
