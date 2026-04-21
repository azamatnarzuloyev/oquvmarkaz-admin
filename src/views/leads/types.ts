import type { DjangoUser } from '@/@types/auth'

export type LeadSource = 'instagram' | 'telegram' | 'referral' | 'website' | 'other'
export type LeadStatus = 'new' | 'no_answer' | 'thinking' | 'trial' | 'converted' | 'lost'
export type ActivityType = 'call' | 'note' | 'status_changed' | 'sms_sent'

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
    new:       'Yangi',
    no_answer: "Bog'lanib bo'lmadi",
    thinking:  "O'ylayapti",
    trial:     'Sinov darsida',
    converted: "To'lov qildi",
    lost:      "Yo'qotildi",
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
    new:       'blue',
    no_answer: 'gray',
    thinking:  'orange',
    trial:     'purple',
    converted: 'green',
    lost:      'red',
}

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
    instagram: 'Instagram',
    telegram:  'Telegram',
    referral:  'Tavsiya',
    website:   'Sayt',
    other:     'Boshqa',
}

export const LEAD_STATUSES: LeadStatus[] = ['new', 'no_answer', 'thinking', 'trial', 'converted', 'lost']

export interface LeadActivity {
    id: number
    type: ActivityType
    content: string
    created_by: number | null
    created_by_name: string
    created_at: string
}

export interface Lead {
    id: number
    full_name: string
    phone: string
    source: LeadSource
    source_display: string
    status: LeadStatus
    status_display: string
    assigned_to: number | null
    assigned_to_name: string
    assigned_to_detail?: DjangoUser
    notes: string
    trial_date: string | null
    lost_reason: string
    converted_at: string | null
    created_at: string
    updated_at: string
    activities?: LeadActivity[]
}

export interface LeadListResponse {
    success: boolean
    data: Lead[]
    meta: {
        total: number
        page: number
        page_size: number
        total_pages: number
        has_next: boolean
        has_previous: boolean
    }
}

export interface LeadCreatePayload {
    full_name: string
    phone: string
    source: LeadSource
    assigned_to?: number | null
    notes?: string
    trial_date?: string | null
}

export interface LeadUpdatePayload extends LeadCreatePayload {
    lost_reason?: string
}

export interface LeadStatusChangePayload {
    status: LeadStatus
    lost_reason?: string
    trial_date?: string | null
}

export interface FunnelData {
    by_status: Partial<Record<LeadStatus, number>>
    total: number
    conversion_rate: number
}

export interface DashboardData {
    by_source: Partial<Record<LeadSource, number>>
    weekly_new: { date: string; count: number }[]
    by_status: Partial<Record<LeadStatus, number>>
    total: number
    conversion_rate: number
}
