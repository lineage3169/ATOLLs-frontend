describe('車輛查詢', () => {
    beforeEach(() => {
        cy.viewport(288, 640)
    })
    it('訪問頁面', () => {
        cy.visit('/m-frontend/vehicle/search')
    })
    it('介面檢查', () => {
        cy.get('.title')
            .contains('車輛查詢')
        cy.get('.ivu-form-item-label')
            .contains('生產編號')
    })
    it('查詢', () => {
        cy.get('.ivu-form-item-content > .ivu-input-wrapper > .ivu-input')
            .type('eTest')
        cy.get('.footer > :nth-child(2)')
            .click()
        cy.get('.id-list__item')
            .click()
    })
    it('查詢結果介面檢查', () => {
        cy.get('.ivu-form-item-label')
            .contains('生產編號')
        cy.get(':nth-child(1) > .info-result__item__label')
            .contains('生產編號')
        cy.get(':nth-child(1) > .info-result__item__content')
            .contains('e2eTest')
        cy.get(':nth-child(2) > .info-result__item__label')
            .contains('底盤編號')
        cy.get(':nth-child(2) > .info-result__item__content')
            .contains('e2eTest')
        cy.get(':nth-child(3) > .info-result__item__label')
            .contains('建立日期')
        cy.get(':nth-child(4) > .info-result__item__label')
            .contains('停車區域')
        cy.get(':nth-child(5) > .info-result__item__label')
            .contains('車位識別碼')
        
        cy.get('.footer > .btn--outline')
            .contains('返回')
    })
})