export function getFormattedDate() {
    const today = new Date()

    // Get the day, month, and year
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()

    // Return the date in DD.MM.YYYY format
    return `${day}.${month}.${year}`
}

export function formatISODate(isoDate: any, format: 'oy' | 'minut') {
    const date = new Date(isoDate)

    // Sana va vaqtni formatlash
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    if (format === 'oy') {
        return `${day}-${month}-${year}`
    } else {
        return `${day}.${month}.${year} ${hours}:${minutes}`
    }
}
