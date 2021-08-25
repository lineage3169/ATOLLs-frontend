describe('選單', () => {
    it('訪問頁面', () => {
        cy.visit('/frontend')
    })
    it('項目檢查', () => {
        cy.get('#menu-item-0 > .c-menu__items__title')
            .contains('車輛管理')
        cy.get('#menu-item-1 > .c-menu__items__title')
            .contains('車位管理')
        cy.get('#menu-item-2 > .c-menu__items__title')
            .contains('停車區域管理')
        cy.get('#menu-item-3 > .c-menu__items__title')
            .contains('紀錄')
        cy.get('#menu-item-4 > .c-menu__items__title')
            .contains('系統設定')
        cy.get('#menu-item-5 > .c-menu__items__title')
            .contains('測試')
        cy.get('#menu-item-6 > .c-menu__items__title')
            .contains('帳號')
        cy.get('#menu-item-7 > .c-menu__items__title')
            .contains('登出')
        cy.get('.c-menu__collect__btn__title')
            .contains('收起側邊欄')
            .click()
        cy.get('.c-menu--collect')
            .should('have.css', 'width', '50px')
        cy.get('.c-menu__collect__btn__icon')
            .click()
    })
    it('連結檢查', () => {
        cy.get('#menu-item-0 > .c-menu__items__title')
            .click()
        cy.get('.vehicle-container')
            .should('be.visible')
        cy.get('#menu-item-1 > .c-menu__items__title')
            .click()
        cy.get('.parking-space-container')
            .should('be.visible')
        cy.get('#menu-item-2 > .c-menu__items__title')
            .click()
        cy.get('.parking-area-container')
            .should('be.visible')
        cy.get('#menu-item-3 > .c-menu__items__title')
            .click()
        cy.get('.log-container')
            .should('be.visible')
        cy.get('#menu-item-4 > .c-menu__items__title')
            .click()
        cy.get('.m-config-system-user')
            .should('be.visible')
        cy.get('#menu-item-5 > .c-menu__items__title')
            .click()
        cy.get('.m-api-test')
            .should('be.visible')
        cy.get('#menu-item-6 > .c-menu__items__title')
            .click()
        cy.get('.account')
            .should('be.visible')
    })
})