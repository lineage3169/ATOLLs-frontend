describe('使用者系統設定', () => {
    it('訪問頁面', () => {
        cy.visit('/frontend/ins/config')
        cy.get('.m-config-system-user')
            .should('be.visible')
        cy.get('.ivu-tabs-nav > :nth-child(5)')
            .click()
        cy.get('.m-system-config')
            .should('be.visible')
    })
    it('介面元件初始', () => {
        cy.get('.panal__title')
            .contains('啟用')
    })
})