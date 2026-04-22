import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getData } from '@/service/get.service'
import { axiosInstance } from '@/service/token.service'

const BASE = import.meta.env.VITE_API_URL
const KEY   = 'staff'

export interface StaffMember {
    id:          number
    phone:       string
    first_name:  string
    last_name:   string
    full_name:   string
    role:        'admin' | 'reception' | 'teacher'
    avatar:      string | null
    is_active:   boolean
    leads_count: number
    created_at:  string
}

export interface StaffFormData {
    phone:      string
    first_name: string
    last_name?: string
    role:       string
    password?:  string
    is_active?: boolean
}

export function useStaff() {
    return useQuery<{ data: StaffMember[]; meta: { total: number } }>({
        queryKey: [KEY],
        queryFn:  () => getData('/auth/staff/'),
    })
}

export function useCreateStaff() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: StaffFormData) =>
            axiosInstance.post(`${BASE}/auth/staff/`, data).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useUpdateStaff() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: StaffFormData & { id: number }) =>
            axiosInstance.patch(`${BASE}/auth/staff/${id}/`, data).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useDeleteStaff() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) =>
            axiosInstance.delete(`${BASE}/auth/staff/${id}/`).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useToggleStaffActive() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) =>
            axiosInstance.post(`${BASE}/auth/staff/${id}/toggle-active/`).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useResetPassword() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, password }: { id: number; password: string }) =>
            axiosInstance.post(`${BASE}/auth/staff/${id}/reset-password/`, { password }).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    })
}
