import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getData } from '@/service/get.service'
import { axiosInstance } from '@/service/token.service'
import type {
    Lead,
    LeadCreatePayload,
    LeadUpdatePayload,
    LeadStatusChangePayload,
    LeadListResponse,
    FunnelData,
    DashboardData,
} from '../types'

const BASE = import.meta.env.VITE_API_URL

export const LEADS_KEY = 'leads'

export function useLeads(params?: Record<string, string | number>) {
    const query = params ? '?' + new URLSearchParams(
        Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString() : ''
    return useQuery<LeadListResponse>({
        queryKey: [LEADS_KEY, params],
        queryFn: () => getData(`/leads/${query}`),
    })
}

export function useLead(id: number) {
    return useQuery<{ success: boolean; data: Lead }>({
        queryKey: [LEADS_KEY, id],
        queryFn: () => getData(`/leads/${id}/`),
        enabled: !!id,
    })
}

export function useLeadFunnel() {
    return useQuery<{ success: boolean; data: FunnelData }>({
        queryKey: [LEADS_KEY, 'funnel'],
        queryFn: () => getData('/leads/stats/funnel/'),
    })
}

export function useLeadDashboard() {
    return useQuery<{ success: boolean; data: DashboardData }>({
        queryKey: [LEADS_KEY, 'dashboard'],
        queryFn: () => getData('/leads/stats/dashboard/'),
        staleTime: 2 * 60 * 1000,
    })
}

export function useCreateLead() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: LeadCreatePayload) =>
            axiosInstance.post(`${BASE}/leads/`, body).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
    })
}

export function useUpdateLead(id: number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: LeadUpdatePayload) =>
            axiosInstance.patch(`${BASE}/leads/${id}/`, body).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
    })
}

export function useChangeLeadStatus() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...body }: LeadStatusChangePayload & { id: number }) =>
            axiosInstance
                .patch(`${BASE}/leads/${id}/change-status/`, body)
                .then((r) => r.data),
        onMutate: async ({ id, status }) => {
            await qc.cancelQueries({ queryKey: [LEADS_KEY] })
            const prev = qc.getQueryData<LeadListResponse>([LEADS_KEY, undefined])
            if (prev) {
                qc.setQueryData<LeadListResponse>([LEADS_KEY, undefined], {
                    ...prev,
                    data: prev.data.map((l) => (l.id === id ? { ...l, status } : l)),
                })
            }
            return { prev }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData([LEADS_KEY, undefined], ctx.prev)
        },
        onSettled: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
    })
}

export function useConvertLead() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) =>
            axiosInstance.post(`${BASE}/leads/${id}/convert/`).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
    })
}

export function useAddActivity() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, type, content }: { id: number; type: string; content: string }) =>
            axiosInstance
                .post(`${BASE}/leads/${id}/activities/`, { type, content })
                .then((r) => r.data),
        onSuccess: (_d, { id }) => qc.invalidateQueries({ queryKey: [LEADS_KEY, id] }),
    })
}
