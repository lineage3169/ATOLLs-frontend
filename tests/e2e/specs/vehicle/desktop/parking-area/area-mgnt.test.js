describe('停車區域管理', () => {
    it('訪問頁面', () => {
        cy.visit('/frontend')
        cy.get('#menu-item-2 > .c-menu__items__title')
            .click()
        cy.get('.ivu-tabs-nav > :nth-child(3)')
            .click()
    })
    it('介面檢查', () => {
        cy.get('.tools')
            .should('be.visible')
        cy.get('.groups-container')
            .should('be.visible')
    })
    it('新增區域', () => {
        cy.get('.group__item--add')
            .click()
        cy.get('.input > .ivu-input')
            .type('e2eTest')
        cy.get('.ivu-select-input')
            .click()
        cy.get(':nth-child(2) > .ivu-form-item-content > .ivu-select > .ivu-select-dropdown > .ivu-select-dropdown-list > :nth-child(1)')
            .click()
        cy.get(':nth-child(7) > .ivu-modal-wrap > .ivu-modal > .ivu-modal-content > .ivu-modal-footer > div > :nth-child(2)')
            .click()
        cy.wait(1500)
        cy.get('.groups-container')
            .then(data => {
                if (!data[0]?.children) throw new Error('新增失敗')
                let isAdded = false
                for (let item of data[0].children) {
                    if (item.children[0].innerText === 'e2eTest')
                        isAdded = true
                }
                if (!isAdded) throw new Error('新增失敗')
            })
        
    })
    it('刪除區域', () => {
        cy.get('.groups-container')
            .then(data => {
                if (!data[0]?.children) throw new Error('刪除失敗: 查無項目')
                let index = -1
                let hasFind = false
                for (let item of data[0].children) {
                    index ++
                    if (item.children[0].innerText === 'e2eTest') {
                        cy.get(`:nth-child(${index + 1}) > .group__item__action > .action__item > .icon`)
                            .click({ force: true })
                        cy.get('.btn--error')
                            .click()
                        hasFind = true
                    }
                }
                if (!hasFind) throw new Error('刪除失敗: 查無項目')
            })
        cy.get('.groups-container')
            .then(data => {
                if (!data[0]?.children) throw new Error('刪除失敗: 查無項目')
                let isDeleted = true
                for (let item of data[0].children) {
                    if (item.children[0].innerText === 'e2eTest')
                        isDeleted = false
                }
                if (!isDeleted) throw new Error('刪除失敗')
            })
        
    })
})