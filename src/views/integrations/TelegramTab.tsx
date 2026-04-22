import { useState } from 'react'
import { Table, Tag, Tooltip, Select, Badge, Spin, Button, message } from 'antd'
import { FaTelegram } from 'react-icons/fa'
import { HiUserAdd, HiDuplicate, HiClock, HiExclamationCircle, HiRefresh, HiLink } from 'react-icons/hi'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getData } from '@/service/get.service'
import { axiosInstance } from '@/service/token.service'

const BASE = import.meta.env.VITE_API_URL

type TgStatus = 'waiting' | 'lead_created' | 'duplicate' | 'failed'

interface TelegramActivity {
    id:           number
    telegram_id:  number
    username:     string
    full_name:    string
    message_text: string
    phone:        string
    status:       TgStatus
    lead_id:      number | null
    lead_name:    string | null
    lead_phone:   string | null
    created_at:   string
}

const STATUS_CONFIG: Record<TgStatus, { label: string; color: string; icon: React.ReactNode }> = {
    waiting:      { label: 'Telefon kutilmoqda', color: 'default',  icon: <HiClock /> },
    lead_created: { label: 'Lead yaratildi',     color: 'success',  icon: <HiUserAdd /> },
    duplicate:    { label: 'Takroriy',            color: 'warning',  icon: <HiDuplicate /> },
    failed:       { label: 'Xato',               color: 'error',    icon: <HiExclamationCircle /> },
}

function useTelegramActivities(status?: string) {
    const qs = status ? `?status=${status}` : ''
    return useQuery<{ data: TelegramActivity[]; meta: { total: number } }>({
        queryKey: ['telegram-activity', status],
        queryFn:  () => getData(`/integrations/telegram/activity/${qs}`),
        refetchInterval: 30_000,
    })
}

function useTelegramSetup() {
    return useQuery<{ success: boolean; info: { result?: { url?: string; pending_update_count?: number } } }>({
        queryKey: ['telegram-setup'],
        queryFn:  () => getData('/integrations/telegram/setup/'),
    })
}

function useSetupWebhook() {
    return useMutation({
        mutationFn: () => axiosInstance.post(`${BASE}/integrations/telegram/setup/`).then((r) => r.data),
    })
}

const StatsBar = ({ activities }: { activities: TelegramActivity[] }) => {
    const total   = activities.length
    const leads   = activities.filter((a) => a.status === 'lead_created').length
    const waiting = activities.filter((a) => a.status === 'waiting').length
    const rate    = total > 0 ? Math.round((leads / total) * 100) : 0
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
                { label: 'Jami xabarlar', value: total,    color: 'text-gray-800' },
                { label: 'Telefon kutilmoqda', value: waiting, color: 'text-amber-500' },
                { label: 'Lead yaratildi', value: leads,   color: 'text-emerald-600' },
                { label: 'Konversiya',    value: `${rate}%`, color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
            ))}
        </div>
    )
}

const TelegramTab = () => {
    const [statusFilter, setStatusFilter] = useState<string>('')

    const { data, isLoading, refetch, isFetching } = useTelegramActivities(statusFilter || undefined)
    const { data: setupData, refetch: refetchSetup } = useTelegramSetup()
    const setupWebhook = useSetupWebhook()

    const activities   = data?.data ?? []
    const webhookUrl   = setupData?.info?.result?.url
    const pendingCount = setupData?.info?.result?.pending_update_count ?? 0
    const isConnected  = !!webhookUrl

    const handleSetup = async () => {
        try {
            await setupWebhook.mutateAsync()
            message.success('Telegram webhook ulandi!')
            refetchSetup()
        } catch {
            message.error('Webhook ulashda xato')
        }
    }

    const columns = [
        {
            title: 'Foydalanuvchi',
            dataIndex: 'full_name',
            render: (name: string, row: TelegramActivity) => (
                <div>
                    <div className="font-medium text-gray-800 text-sm">{name || '—'}</div>
                    {row.username && (
                        <a
                            href={`https://t.me/${row.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-sky-500 hover:underline"
                        >
                            @{row.username}
                        </a>
                    )}
                    {!row.username && (
                        <span className="text-xs text-gray-400 font-mono">ID: {row.telegram_id}</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Xabar',
            dataIndex: 'message_text',
            render: (text: string) =>
                text ? (
                    <Tooltip title={text}>
                        <span className="text-sm text-gray-600 truncate max-w-xs block">{text}</span>
                    </Tooltip>
                ) : <span className="text-gray-300 text-xs">—</span>,
        },
        {
            title: 'Telefon',
            dataIndex: 'phone',
            width: 140,
            render: (phone: string) =>
                phone ? <span className="font-mono text-sm text-gray-700">{phone}</span>
                      : <span className="text-gray-300 text-xs">—</span>,
        },
        {
            title: 'Holat',
            dataIndex: 'status',
            width: 150,
            render: (s: TgStatus) => {
                const cfg = STATUS_CONFIG[s]
                return <Tag color={cfg.color} icon={cfg.icon} className="text-xs">{cfg.label}</Tag>
            },
        },
        {
            title: 'Lead',
            dataIndex: 'lead_name',
            width: 130,
            render: (_: unknown, row: TelegramActivity) =>
                row.lead_id ? (
                    <div>
                        <div className="text-xs font-medium text-gray-700">{row.lead_name}</div>
                        <div className="text-xs text-gray-400">{row.lead_phone}</div>
                    </div>
                ) : <span className="text-gray-300 text-xs">—</span>,
        },
        {
            title: 'Vaqt',
            dataIndex: 'created_at',
            width: 120,
            render: (v: string) => (
                <span className="text-xs text-gray-400">
                    {new Date(v).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
            ),
        },
    ]

    return (
        <div>
            {/* Connection card */}
            <div className={`rounded-2xl p-5 mb-5 flex items-center gap-4 border ${
                isConnected
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100'
                    : 'bg-gray-50 border-gray-200'
            }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow ${
                    isConnected ? 'bg-sky-500' : 'bg-gray-300'
                }`}>
                    <FaTelegram className="text-white text-2xl" />
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                        {isConnected ? 'Telegram bot ulangan' : 'Telegram bot ulanmagan'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                        {isConnected ? (
                            <Badge status="success" text={`Webhook faol • ${pendingCount} kutilayotgan update`} />
                        ) : (
                            <Badge status="default" text="Webhook o'rnatilmagan" />
                        )}
                    </div>
                    {webhookUrl && (
                        <div className="text-xs text-gray-400 mt-1 font-mono truncate">{webhookUrl}</div>
                    )}
                </div>
                <Button
                    icon={<HiLink />}
                    type={isConnected ? 'default' : 'primary'}
                    loading={setupWebhook.isPending}
                    onClick={handleSetup}
                    className={isConnected ? '' : 'bg-sky-500 border-sky-500 hover:bg-sky-600'}
                >
                    {isConnected ? 'Webhook yangilash' : 'Webhook ulash'}
                </Button>
            </div>

            {/* Bot info card */}
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 mb-5">
                <div className="text-xs font-semibold text-sky-700 mb-2">Bot qanday ishlaydi?</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-sky-600">
                    {[
                        { step: '1', text: 'Foydalanuvchi botga /start yozadi' },
                        { step: '2', text: 'Bot telefon raqam so\'raydi' },
                        { step: '3', text: 'Raqam kelganda — lead avtomatik yaratiladi' },
                    ].map(({ step, text }) => (
                        <div key={step} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{step}</div>
                            <span>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            {!isLoading && <StatsBar activities={activities} />}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-50">
                    <div className="font-semibold text-gray-700 text-sm">Faoliyat logi</div>
                    <div className="flex items-center gap-2">
                        <Select
                            allowClear
                            placeholder="Holat"
                            size="small"
                            style={{ width: 170 }}
                            value={statusFilter || undefined}
                            onChange={(v) => setStatusFilter(v ?? '')}
                            options={Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))}
                        />
                        <button
                            onClick={() => refetch()}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            <HiRefresh className={isFetching ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16"><Spin size="large" /></div>
                ) : activities.length === 0 ? (
                    <div className="py-16 text-center">
                        <FaTelegram className="text-4xl text-gray-200 mx-auto mb-3" />
                        <div className="text-gray-400 text-sm">Hali hech qanday faoliyat yo'q</div>
                        <div className="text-gray-300 text-xs mt-1">Botga birinchi xabar kelganda bu yerda ko'rinadi</div>
                    </div>
                ) : (
                    <Table
                        dataSource={activities}
                        columns={columns}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 20, showTotal: (t) => `Jami: ${t}` }}
                    />
                )}
            </div>
        </div>
    )
}

export default TelegramTab
