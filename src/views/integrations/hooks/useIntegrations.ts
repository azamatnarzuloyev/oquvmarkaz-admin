import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getData } from '@/service/get.service'
import { axiosInstance } from '@/service/token.service'
import type { WebhookToken, DailyStatRow, OverviewData, InstagramActivity } from '../types'

const BASE = import.meta.env.VITE_API_URL
const KEY   = 'integrations'

export function useWebhookTokens() {
    return useQuery<{ results: WebhookToken[] }>({
        queryKey: [KEY, 'tokens'],
        queryFn:  () => getData('/integrations/tokens/'),
    })
}

export function useTokenStats(id: number) {
    return useQuery<{ success: boolean; data: DailyStatRow[] }>({
        queryKey: [KEY, 'tokens', id, 'stats'],
        queryFn:  () => getData(`/integrations/tokens/${id}/stats/`),
        enabled:  !!id,
    })
}

export function useIntegrationsOverview() {
    return useQuery<{ success: boolean; data: OverviewData }>({
        queryKey: [KEY, 'overview'],
        queryFn:  () => getData('/integrations/tokens/overview/'),
        staleTime: 60 * 1000,
    })
}

export function useCreateToken() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: { name: string; platform: string }) =>
            axiosInstance.post(`${BASE}/integrations/tokens/`, body).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useDeleteToken() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) =>
            axiosInstance.delete(`${BASE}/integrations/tokens/${id}/`).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useToggleToken() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
            axiosInstance.patch(`${BASE}/integrations/tokens/${id}/`, { is_active }).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useInstagramActivities(params?: { event_type?: string; status?: string }) {
    const query = new URLSearchParams()
    if (params?.event_type) query.set('event_type', params.event_type)
    if (params?.status) query.set('status', params.status)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return useQuery<{ results: InstagramActivity[]; count: number }>({
        queryKey: [KEY, 'instagram-activity', params],
        queryFn:  () => getData(`/integrations/instagram/activity/${qs}`),
        refetchInterval: 30_000,
    })
}
