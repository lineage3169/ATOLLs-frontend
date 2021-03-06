describe('建立車位', () => {
    beforeEach(() => {
        cy.viewport(288, 640)
    })
    it('訪問頁面', () => {
        cy.visit('/m-frontend/parking-space/create')
    })
    it('介面檢查', () => {
        cy.get('.title')
            .contains('建立車位')
        cy.get(':nth-child(1) > .ivu-form-item-label')
            .contains('區域')
        cy.get('.mt-10 > .ivu-form-item-label')
            .contains('車位識別碼')
    })
    it('建立車位', () => {
        cy.get('.ivu-select-input')
            .click()
        cy.get('.ivu-select-dropdown-list > :nth-child(1)')
            .click()
        cy.get('.ivu-input')
            .type('e2eTest_PS')
        cy.get('.btn')
            .click()
        cy.wait(2500)
    })
    it('查詢車位', () => {
        cy.viewport(1366, 768)
        cy.visit('/frontend')
        cy.get('#menu-item-1 > .c-menu__items__title')
            .click()
        cy.get('.ivu-input')
            .type('e2eTest_PS')
        cy.get('.ivu-btn-primary')
            .click()
        cy.get('.ivu-table-body > table > .ivu-table-tbody > :nth-child(1) > :nth-child(1)')
            .contains('e2eTest_PS')
    })
})