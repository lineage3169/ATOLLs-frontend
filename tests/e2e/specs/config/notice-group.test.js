describe('使用者系統設定', () => {
    it('訪問頁面', () => {
        cy.visit('/frontend/ins/config')
        cy.get('.m-config-system-user')
            .should('be.visible')
        cy.get('.ivu-tabs-nav > :nth-child(4)')
            .click()
        cy.get('.m-config-notice-group')
            .should('be.visible')
    })
    it('介面元件初始', () => {
        cy.get('.tools-left__search')
            .should('be.visible')
        cy.get('.tools-right > .btn')
            .should('be.visible')
            .contains('新增群組')
    })
    it('新增群組 (名稱驗證)', () => {
        cy.get('.tools-right > .btn')
            .click({ force: true })
        cy.get('.ivu-modal-wrap > .ivu-modal > .ivu-modal-content > .ivu-modal-header')
            .contains('新增群組')
        cy.get('.form__items__label')
            .contains('群組名稱')
        cy.get(':nth-child(1) > .ivu-transfer-list-header > .ivu-transfer-list-header-title')
            .contains('使用者')
        cy.get(':nth-child(3) > .ivu-transfer-list-header > .ivu-transfer-list-header-title')
            .contains('已選擇')
        cy.get('.m-config-notice-group-modal > .ivu-modal > .ivu-modal-content > .ivu-modal-footer > div > :nth-child(2)')
            .should('be.disabled')
        const verifyText = ['~', '!', '@', '#', '$', '%',
            '^', '&', '*', '(', ')', '?',
            '<', '>', '/', '[', ']', '{',
            '}', '|', '-', '_', '+', '\\',
            '中文']
        verifyText.forEach(text => {
            cy.get('.ivu-input')
                .clear()
                .type(text)
            cy.get('.form__error-msg')
                .should('be.visible')
                .contains('不允許的字元')
        })
    })
    it('新增群組', () => {
        cy.get('.ivu-input')
            .clear()
            .type('e2eTest')
            .type('{enter}')
        cy.get(':nth-child(1) > .ivu-transfer-list-header > .ivu-checkbox-default')
            .click()
        cy.get('.ivu-transfer-operation > :nth-child(2)')
            .click()
        cy.get('.m-config-notice-group-modal > .ivu-modal > .ivu-modal-content > .ivu-modal-footer > div > :nth-child(2)')
            .should('not.be.disabled')
            .click()
        cy.wait(2000)
        cy.get('.list')
            .children()
            .then(data => {
                let index = 0
                for (let i = 0; i < data.length; i++) {
                    const groupName = data[i].childNodes[0].childNodes[0].innerText.slice(0, 7)
                    if (groupName === 'e2eTest') index = i + 1
                }
                if (index === 0) throw new Error('新增失敗')
            })
    })
    it('新增群組 (名稱重複)', () => {
        cy.get('.tools-right > .btn')
            .click({ force: true })
        cy.get('.ivu-input')
            .clear()
            .type('e2eTest')
        cy.get('.check-name-status > .ivu-icon')
            .should('have.class', 'ivu-icon-md-close-circle')
        cy.get('.m-config-notice-group-modal > .ivu-modal > .ivu-modal-content > .ivu-modal-footer > div > .btn--outline')
            .click()
    })
    it('查詢群組', () => {
        cy.get('.tools-left__search > input')
            .clear()
            .type('e2eTest')
            .type('{enter}')
        cy.get('.list')
            .children()
            .then(data => {
                if (data.length !== 1) throw new Error('查詢失敗')
            })
        cy.get('.tools-left__search > input')
            .clear()
            .type('e2eTestXXXXX')
            .type('{enter}')
        cy.get('.error-msg')
            .should('be.visible')
        cy.get('.tools-left__search > input')
            .clear()
            .type('{enter}')
    })
    it('變更群組', () => {
        cy.get('.list')
            .children()
            .then(data => {
                let index = 0
                for (let i = 0; i < data.length; i++) {
                    const groupName = data[i].childNodes[0].childNodes[0].innerText.slice(0, 7)
                    if (groupName === 'e2eTest') index = i + 1
                }
                cy.get(':nth-child(' + index + ') > .list-items__menu > .list-items__menu__container')
                    .trigger('mouseover')
                cy.get(':nth-child(' + index + ') > .list-items__menu > .list-items__menu__container > :nth-child(1)')
                    .click()
                cy.get('.ivu-input')
                    .clear()
                    .type('e2e')
                    .type('{enter}')
                cy.get('.m-config-notice-group-modal > .ivu-modal > .ivu-modal-content > .ivu-modal-footer > div > :nth-child(2)')
                    .click()
                cy.get('.list')
                    .children()
                    .then(data => {
                        let hasChanged = false
                        for (let i = 0; i < data.length; i++) {
                            const groupName = data[i].childNodes[0].childNodes[0].innerText.slice(0, 3)
                            if (groupName === 'e2e') hasChanged = true
                        }
                        if (!hasChanged) throw new Error('編輯群組失敗')
                    })
            })
        cy.wait(2000)
    })
    it('刪除群組', () => {
        cy.get('.list')
            .children()
            .then(data => {
                let index = 0
                for (let i = 0; i < data.length; i++) {
                    const groupName = data[i].childNodes[0].childNodes[0].innerText.slice(0, 3)
                    if (groupName === 'e2e') index = i + 1
                }
                cy.get(':nth-child(' + index + ') > .list-items__menu > .list-items__menu__container')
                    .trigger('mouseover')
                cy.get(':nth-child(' + index + ') > .list-items__menu > .list-items__menu__container > :nth-child(2)')
                    .click()
                cy.get('.btn--error')
                    .click()
                cy.wait(1000)
                cy.get('.list')
                    .children()
                    .then(data => {
                        let isDeleted = true
                        for (let i = 0; i < data.length; i++) {
                            const groupName = data[i].childNodes[0].childNodes[0].innerText.slice(0, 3)
                            if (groupName === 'e2e') isDeleted = false
                        }
                        if (!isDeleted) throw new Error('刪除群組失敗')
                    })
            })
    })
})