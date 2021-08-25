describe('檢視剩餘車位', () => {
    it('訪問頁面', () => {
        cy.visit('/frontend')
        cy.get('#menu-item-2 > .c-menu__items__title')
            .click()
    })
    it('介面檢查', () => {
        cy.get('.tools')
            .should('be.visible')
        cy.get('.garages-container')
            .should('be.visible')
    })
})