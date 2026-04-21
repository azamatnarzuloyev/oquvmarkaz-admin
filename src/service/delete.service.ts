import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from './token.service'
const BASE_URI = import.meta.env.VITE_API_URL

export const deleteData = async ({ id, url }: { id: string; url: string }) => {
    const res = await axiosInstance.delete(`${BASE_URI}${url}/${id}`)
    return res.data
}

export const useDelete = (type: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type] })
        },
    })
}
