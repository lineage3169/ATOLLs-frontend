describe('建立車籍', () => {
    beforeEach(() => {
        cy.viewport(288, 640)
    })
    it('訪問頁面', () => {
        cy.visit('/m-frontend/vehicle/create')
        cy.get('.title')
            .contains('建立車籍')
    })
    it('介面檢查', () => {
        cy.get('.mb-20 > .ivu-form-item-label')
            .contains('生產編號')
        cy.get(':nth-child(2) > .ivu-form-item-label')
            .contains('底盤編號')
        cy.get(':nth-child(3) > .ivu-form-item-label')
            .contains('QRcode')
        cy.get('.c-divider__title')
            .contains('點收')
        const label = ['鑰匙', '交車禮、牌照登記書', '三角警示牌', '天線、音源線',
        '車牌架', '點菸器', '車主手冊、急救包', '置物籃、掛網', '前檔油膜清除劑',
        '拖車勾', '啟動按鈕', 'SD卡', '打氣機、補胎劑']
        label.forEach((item, index) => {
            const i = index + 4
            cy.get(`.view > :nth-child(${i})`)
                .contains(item)
        })
        cy.get('.mt-10.mb-20')
            .contains('待複檢')
        cy.scrollTo('top')
    })
    it('建立車籍', () => {
        for (let i = 1; i < 4; i++) {
            cy.get(`:nth-child(${i}) > .ivu-form-item-content > .ivu-input-wrapper > .ivu-input`)
                .type('e2eTest', { force: true })
        }
        // 點收
        const cehckbox = [4, 5, 6, 7, 8, 9, 12, 14, 15, 16]
        cehckbox.forEach(item => {
            cy.get(`:nth-child(${item}) > .ivu-checkbox > .ivu-checkbox-input`)
                .click()
            if (item === 4) {
                cy.get('.ivu-input-number-input')
                    .type(2)
            }
            if (item === 8) {
                cy.get('.w-100 > .ivu-input')
                    .type('e2eTest')
            }
        })
        // 待複檢
        cy.get('.mt-10.mb-20 > .ivu-checkbox > .ivu-checkbox-input')
            .click()
        cy.get('.ivu-input-type-textarea > .ivu-input')
            .type('e2eTest')
        cy.get('.btn')
            .click()
        cy.wait(2500)
    })
    it('建立成功', () => {
        cy.viewport(1366, 768)
        cy.visit('/frontend')
        cy.get('#menu-item-0 > .c-menu__items__title')
            .click()
        cy.get(':nth-child(2) > .ivu-input-wrapper > .ivu-input')
            .type('e2eTest')
        cy.get('.ivu-btn-primary')
            .click()
        cy.get('.ivu-table-body > table > .ivu-table-tbody > .ivu-table-row')
        cy.get('.ivu-table-body > table > .ivu-table-tbody > .ivu-table-row')
            .children()
            .then(list => {
                const isSuccess = Object.values(list)
                    .some(item => item.innerText === 'e2eTest')
                if (!isSuccess) throw new Error('建立車籍失敗')
            })
    })
})