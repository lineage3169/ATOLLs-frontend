describe('選單切換', () => {
    it('訪問頁面', () => {
        cy.visit('/frontend')
    })
    it('滑鼠懸停顯示', () => {
        cy.get('[href="/frontend/ins/config"] > .c-menu__items')
            .trigger('mouseover')
            .contains('政策')
        cy.get('[href="/frontend/account"] > .c-menu__items')
            .trigger('mouseover')
            .contains('帳號')
        cy.get('[href="/frontend/logout"] > .c-menu__items ')
            .trigger('mouseover')
            .contains('登出')
    })
    it('系統設定', () => {
        cy.get('[href="/frontend/ins/config"] > .c-menu__items > .c-menu__items__icons')
            .click()
        cy.get('.m-config-system-user')
            .should('be.visible')
    })
    it('測試', () => {
        cy.get('[href="/frontend/develop"] > .c-menu__items > .c-menu__items__icons')
            .click()
        cy.get('.m-api-test')
            .should('be.visible')
    })
    it('帳號', () => {
        cy.get('[href="/frontend/account"] > .c-menu__items > .c-menu__items__icons')
            .click()
        cy.get('.m-system-config')
            .should('be.visible')
    })
})