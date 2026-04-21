import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from './token.service'
const BASE_URI = import.meta.env.VITE_API_URL

export const updateData = async ({ url, body }: { url: string; body: any }) => {
    const res = await axiosInstance.put(`${BASE_URI}${url}`, body)
    return res.data
}

export const patchData = async ({ url, body }: { url: string; body: any }) => {
    const res = await axiosInstance.patch(`${BASE_URI}${url}`, body)
    return res.data
}

export const usePatch = (type: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: patchData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type] })
        },
    })
}

export const useUpdate = (type: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type] })
        },
    })
}
