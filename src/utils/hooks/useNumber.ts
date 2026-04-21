export const usePrice = (value: string) => {
    return value?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
export const usePriceParse = (value: string) => {
    return value?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const usePriceFix = (value: number) => {
    return value
        ?.toFixed(2)
        ?.toString()
        ?.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const useValue = (value: string | number) => {
    if (!value) return '' // Agar qiymat bo'sh yoki undefined bo'lsa, bo'sh satrni qaytaradi
    const cleanValue = value.toString().replace(/\s/g, '') // Kiritishdagi bo'sh joylarni olib tashlaydi
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') // Har uch xonadan keyin bo'sh joy qo'shadi
}

export function formatNumber(input: string | number): number {
    if (typeof input === 'string') {
        return Number(input.replace(/\s+/g, ''))
    }
    if (typeof input === 'number') {
        return input // Agar input allaqachon raqam bo'lsa, qaytarib yuboramiz
    }
    return 0 // Noto'g'ri tip bo'lsa, default qiymat
}

export const numberWithCommas = (num: any): any => {
    if (typeof num === 'string') {
        return Number(num?.replaceAll(',', ''))
    }
    if (typeof num === 'number') {
        return num // Agar input allaqachon raqam bo'lsa, qaytarib yuboramiz
    }
}
export function formatNumberSum(num: string | number): string {
    // Check if num is a valid number or can be converted to a number
    if (num === null || num === undefined || isNaN(Number(num))) {
        return '' // Return an empty string or a default value
    }

    // Convert the number to a string
    const numStr = num.toString()

    // If there is a "." and more than 2 digits after it
    if (numStr.includes('.') && numStr.split('.')[1].length > 2) {
        return parseFloat(num.toString()).toFixed(2) // Format to 2 decimal places
    }

    // If there's no "." or it has 2 or fewer digits, return the number as is
    return numStr
}

export function cleanPhoneNumber(phoneNumber: string) {
    return phoneNumber.replace(/[^\d]/g, '')
}


export const calculateTotalPrice = (cards: any[], userId?: string) => {
    const filteredCards = userId 
        ? cards?.filter((card: any) => card?.userId === userId)
        : cards

    return filteredCards?.reduce((total: number, card: any) => {
        const cardTotal = card?.products?.reduce((sum: number, product: any) => {
            return sum + (product?.price || 0) * (product?.count || 1)
        }, 0)
        return total + cardTotal
    }, 0) || 0
}