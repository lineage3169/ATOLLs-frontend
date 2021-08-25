describe('編輯', () => {
    it('訪問頁面', () => {
        cy.visit('/frontend')
        cy.get('#menu-item-0 > .c-menu__items__title')
            .click()
        cy.get('.ivu-tabs-nav > :nth-child(3)')
            .click()
        cy.get('.l-view')
            .should('be.visible')
        cy.get('.ivu-tabs-tab-active')
            .contains('編輯')
    })
    it('編輯', () => {
        // 編輯按鈕
        cy.get('.ivu-table-body > table > .ivu-table-tbody > :nth-child(1) > :nth-child(10) > .ivu-table-cell > .ivu-btn')
            .click({ force: true })
        // 備註
        cy.get(':nth-child(5) > .ivu-input-wrapper > .ivu-input')
            .clear({ force: true })
            .type('e2eTest', { force: true })
        cy.get('.ivu-modal-footer > div > :nth-child(2)')
            .click()
        // 等API
        cy.wait(3000)
        cy.get('.ivu-table-body > table > .ivu-table-tbody > :nth-child(1) > :nth-child(1)')
            .click()
        cy.get('.ivu-table-body > table > .ivu-table-tbody > :nth-child(2)')
            .contains('e2eTest')
    })
})