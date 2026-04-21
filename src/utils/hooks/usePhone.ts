import { useMemo } from 'react'

export function cleanPhoneNumber(phoneNumber: string) {
    return phoneNumber.replace(/[^\d]/g, '')
}

export function formatPhoneNumber(number: string) {
    const cleaned = ('' + number).replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/)
    if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`
    }
    return number
}

export function useMaskPhone(phone: string) {
    const maskedPhone = useMemo(() => {
        // Raqamni faqat sonlardan tozalaymiz
        const cleaned = phone.replace(/\D/g, '')

        // Raqam 12 ta raqam bo'lishi kerak: 998XXXXXXXXX
        if (!/^998\d{9}$/.test(cleaned)) {
            return phone // noto‘g‘ri format bo‘lsa, o‘zini qaytar
        }

        // Oxirgi 4 raqamni olish
        const lastFour = cleaned.slice(-4)
        const firstPart = cleaned.slice(0, 3) // 998
        const maskedPart = '******'

        return `+${firstPart}${maskedPart}${lastFour.slice(0, 2)}-${lastFour.slice(2)}`
    }, [phone])

    return maskedPhone
}
