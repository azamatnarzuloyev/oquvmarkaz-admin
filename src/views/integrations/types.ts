export type WebhookPlatform = 'instagram' | 'telegram' | 'facebook' | 'website' | 'other'

export const PLATFORM_LABELS: Record<WebhookPlatform, string> = {
    instagram: 'Instagram',
    telegram:  'Telegram',
    facebook:  'Facebook',
    website:   'Sayt formi',
    other:     'Boshqa',
}

export interface WebhookToken {
    id:                number
    name:              string
    platform:          WebhookPlatform
    token:             string
    is_active:         boolean
    webhook_url:       string
    leads_count:       number
    total_impressions: number
    total_clicks:      number
    created_at:        string
}

export interface DailyStatRow {
    date:        string
    impressions: number
    clicks:      number
    leads:       number
}

export interface TokenOverview {
    id:          number
    name:        string
    platform:    WebhookPlatform
    is_active:   boolean
    impressions: number
    clicks:      number
    leads:       number
    ctr:         number
    cpl:         number
}

export interface OverviewData {
    tokens:             TokenOverview[]
    total_impressions:  number
    total_clicks:       number
    total_leads:        number
    avg_ctr:            number
}

export type InstagramEventType = 'comment' | 'dm'
export type InstagramStatus    = 'replied' | 'dm_sent' | 'lead_created' | 'failed'

export interface InstagramActivity {
    id:           number
    event_type:   InstagramEventType
    sender_id:    string
    sender_name:  string
    message_text: string
    ai_reply:     string
    status:       InstagramStatus
    lead_id:      number | null
    lead_name:    string | null
    lead_phone:   string | null
    created_at:   string
}
