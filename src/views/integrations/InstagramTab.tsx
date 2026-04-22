import { useState } from 'react'
import { Table, Tag, Tooltip, Select, Badge, Spin } from 'antd'
import { FaInstagram } from 'react-icons/fa'
import { HiChatAlt2, HiMail, HiUserAdd, HiExclamationCircle, HiRefresh } from 'react-icons/hi'
import { useInstagramActivities } from './hooks/useIntegrations'
import type { InstagramActivity, InstagramEventType, InstagramStatus } from './types'

const STATUS_CONFIG: Record<InstagramStatus, { label: string; color: string; icon: React.ReactNode }> = {
    replied:      { label: 'Javob berildi',  color: 'blue',    icon: <HiChatAlt2 /> },
    dm_sent:      { label: 'DM yuborildi',   color: 'purple',  icon: <HiMail /> },
    lead_created: { label: 'Lead yaratildi', color: 'success', icon: <HiUserAdd /> },
    failed:       { label: 'Xato',           color: 'error',   icon: <HiExclamationCircle /> },
}

const EVENT_LABELS: Record<InstagramEventType, string> = {
    comment: 'Comment',
    dm:      'Direct Message',
}

const StatsBar = ({ activities }: { activities: InstagramActivity[] }) => {
    const counts = activities.reduce(
        (acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1
            return acc
        },
        {} as Record<string, number>,
    )
    const total = activities.length
    const leads = counts['lead_created'] || 0
    const dms   = (counts['dm_sent'] || 0) + leads
    const rate  = total > 0 ? Math.round((leads / total) * 100) : 0

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
                { label: "Jami hodisalar", value: total, color: "text-gray-800" },
                { label: "DM yuborildi",   value: dms,   color: "text-purple-600" },
                { label: "Lead yaratildi", value: leads, color: "text-emerald-600" },
                { label: "Konversiya",     value: `${rate}%`, color: "text-blue-600" },
            ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
            ))}
        </div>
    )
}

const InstagramTab = () => {
    const [eventFilter, setEventFilter] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('')

    const { data, isLoading, refetch, isFetching } = useInstagramActivities({
        event_type: eventFilter || undefined,
        status:     statusFilter || undefined,
    })

    const activities = data?.data ?? []

    const columns = [
        {
            title: 'Tur',
            dataIndex: 'event_type',
            width: 110,
            render: (v: InstagramEventType) => (
                <Tag color={v === 'comment' ? 'orange' : 'purple'} className="text-xs">
                    {EVENT_LABELS[v]}
                </Tag>
            ),
        },
        {
            title: 'Foydalanuvchi',
            dataIndex: 'sender_name',
            render: (name: string, row: InstagramActivity) => (
                <div>
                    <div className="font-medium text-gray-800 text-sm">
                        {name || <span className="text-gray-400 italic">Anonim</span>}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{row.sender_id}</div>
                </div>
            ),
        },
        {
            title: 'Xabar',
            dataIndex: 'message_text',
            render: (text: string) => (
                <Tooltip title={text}>
                    <span className="text-sm text-gray-600 line-clamp-1 max-w-xs block truncate">
                        {text || '—'}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'AI Javob',
            dataIndex: 'ai_reply',
            render: (text: string) =>
                text ? (
                    <Tooltip title={text}>
                        <span className="text-xs text-blue-500 line-clamp-1 max-w-xs block truncate italic">
                            {text}
                        </span>
                    </Tooltip>
                ) : (
                    <span className="text-gray-300 text-xs">—</span>
                ),
        },
        {
            title: 'Holat',
            dataIndex: 'status',
            width: 140,
            render: (s: InstagramStatus) => {
                const cfg = STATUS_CONFIG[s]
                return (
                    <Tag color={cfg.color} icon={cfg.icon} className="text-xs">
                        {cfg.label}
                    </Tag>
                )
            },
        },
        {
            title: 'Lead',
            dataIndex: 'lead_name',
            width: 140,
            render: (_: unknown, row: InstagramActivity) =>
                row.lead_id ? (
                    <div>
                        <div className="text-xs font-medium text-gray-700">{row.lead_name}</div>
                        <div className="text-xs text-gray-400">{row.lead_phone}</div>
                    </div>
                ) : (
                    <span className="text-gray-300 text-xs">—</span>
                ),
        },
        {
            title: 'Vaqt',
            dataIndex: 'created_at',
            width: 130,
            render: (v: string) => (
                <span className="text-xs text-gray-400">
                    {new Date(v).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
            ),
        },
    ]

    return (
        <div>
            {/* Connection status card */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-5 mb-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow">
                    <FaInstagram className="text-white text-2xl" />
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-gray-800">Instagram ulangan</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                        <Badge status="success" text="innosoft_ceo akkaunti faol" />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Webhook: <span className="font-mono text-pink-600">lead.innosoft.uz/api/webhooks/instagram/</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                        Meta App Review kutilmoqda
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Real foydalanuvchilar uchun</div>
                </div>
            </div>

            {/* Stats */}
            {!isLoading && <StatsBar activities={activities} />}

            {/* Filters + table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-50">
                    <div className="font-semibold text-gray-700 text-sm">Faoliyat logi</div>
                    <div className="flex items-center gap-2">
                        <Select
                            allowClear
                            placeholder="Tur"
                            size="small"
                            style={{ width: 140 }}
                            value={eventFilter || undefined}
                            onChange={(v) => setEventFilter(v ?? '')}
                            options={[
                                { value: 'comment', label: 'Comment' },
                                { value: 'dm',      label: 'Direct Message' },
                            ]}
                        />
                        <Select
                            allowClear
                            placeholder="Holat"
                            size="small"
                            style={{ width: 150 }}
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
                    <div className="flex items-center justify-center py-16">
                        <Spin size="large" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="py-16 text-center">
                        <FaInstagram className="text-4xl text-gray-200 mx-auto mb-3" />
                        <div className="text-gray-400 text-sm">Hali hech qanday faoliyat yo'q</div>
                        <div className="text-gray-300 text-xs mt-1">
                            Instagram postingizga izoh yozilganda bu yerda ko'rinadi
                        </div>
                    </div>
                ) : (
                    <Table
                        dataSource={activities}
                        columns={columns}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 20, showTotal: (t) => `Jami: ${t}` }}
                        className="instagram-activity-table"
                    />
                )}
            </div>
        </div>
    )
}

export default InstagramTab
