import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from './token.service'
import axios from 'axios'

const BASE_URI = import.meta.env.VITE_API_URL

export const postData = async ({ url, body }: { url: string; body: any }) => {
    const res = await axiosInstance.post(`${BASE_URI}${url}`, body)
    return res.data
}

export const usePost = (type: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: postData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type] })
        },
    })
}

export const postData2 = async ({ url, body }: { url: string; body: any }) => {
    const res = await axios.post(`${url}`, body)
    return res.data
}

export const usePost2 = (type: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: postData2,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type] })
        },
    })
}
