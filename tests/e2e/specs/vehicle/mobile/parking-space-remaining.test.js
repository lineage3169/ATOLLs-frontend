describe('檢視剩餘車位', () => {
    beforeEach(() => {
        cy.viewport(288, 640)
    })
    it('訪問頁面', () => {
        cy.visit('/m-frontend/parking-space/remaining')
    })
    it('介面檢查', () => {
        cy.get('.title')
            .contains('剩餘車位')
        cy.get('.p-remaining-parking-space')
            .should('be.visible')
    })
    it('快速查詢', () => {
        function quickSearch(string) {
            return new Promise((resolve, reject) => {
                cy.get('.ivu-input')
                    .clear()
                cy.get('.ivu-input')
                    .type(string)
                resolve(
                    cy.get('.garages')
                        .should(data => {
                            for (let item of data) {
                                if (item.children[0].innerText.indexOf(string) === -1)
                                    throw new Error('快速查詢有誤')
                            }
                        })
                )
              })
        }
        const testString = ['A', 'B', 'C', 'D']
        testString.forEach(async(str) => {
            await quickSearch(str)
        })
        cy.get('.ivu-input')
            .clear()
    })
})