describe('車位查詢', () => {
    beforeEach(() => {
        cy.viewport(288, 640)
    })
    it('訪問頁面', () => {
        cy.visit('/m-frontend/parking-space/search')
    })
    it('介面檢查', () => {
        cy.get('.title')
            .contains('車位查詢')
        cy.get('.ivu-form-item-label')
            .contains('車位識別碼')
    })
    it('查詢', () => {
        cy.get('.ivu-input')
            .type('e2eTest_PS')
        cy.get('.btn')
            .click()
    })
    it('查詢結果介面', () => {
        cy.get('.mt-30 > :nth-child(1) > .info-result__item__label')
            .contains('車位識別碼')
        cy.get('.mt-30 > :nth-child(1) > .info-result__item__content')
            .contains('e2eTest_PS')
        cy.get('.mt-30 > :nth-child(2) > .info-result__item__label')
            .contains('狀態')
    })
})