function dateFormat(data, clock = true) {
    if (!data) return ''
    function pad(num) {
        return num.toString().padStart(2, '0')
    }
    const date = new Date(data)
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const h = pad(date.getHours())
    const m = pad(date.getMinutes())
    const s = pad(date.getSeconds())
    if (clock)
        return `${year}-${month}-${day} ${h}:${m}:${s}`
    else
        return `${year}-${month}-${day}`
}

const startDate = new Date()
startDate.setDate(1)
const Y = startDate.getFullYear()
const M = startDate.getMonth() + 1
const endDate = new Date(Y, M, 0)

export { dateFormat, startDate, endDate}