import axios from 'axios'
import { axiosInstance } from './token.service'

const BASE_URI = import.meta.env.VITE_API_URL

export const getData = async (url: string) => {
    const res = await axiosInstance.get(`${BASE_URI}${url}`)
    return res.data
}

export const getApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data
        if (typeof detail === 'string') return detail
        if (detail?.error?.message) return detail.error.message
        if (detail?.detail) return detail.detail
        return error.message
    }
    if (error instanceof Error) return error.message
    return 'Noma\'lum xatolik'
}
