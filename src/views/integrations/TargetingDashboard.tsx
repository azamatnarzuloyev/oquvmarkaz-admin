import { useState } from 'react'
import { Select, Empty } from 'antd'
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    CartesianGrid,
} from 'recharts'
import dayjs from 'dayjs'
import { HiEye, HiCursorClick, HiUserAdd, HiTrendingUp } from 'react-icons/hi'
import { FaInstagram, FaTelegram, FaFacebook, FaGlobe } from 'react-icons/fa'
import { HiLink } from 'react-icons/hi'
import {
    useIntegrationsOverview, useWebhookTokens, useTokenStats,
} from './hooks/useIntegrations'
import type { WebhookPlatform, TokenOverview } from './types'
import { PLATFORM_LABELS } from './types'

const PLATFORM_ICON: Record<WebhookPlatform, React.ReactNode> = {
    instagram: <FaInstagram className="text-pink-500" />,
    telegram:  <FaTelegram className="text-sky-500" />,
    facebook:  <FaFacebook className="text-blue-600" />,
    website:   <FaGlobe className="text-emerald-500" />,
    other:     <HiLink className="text-gray-400" />,
}

interface KpiProps {
    icon: React.ReactNode
    label: string
    value: string | number
    sub?: string
    color: string
    bg: string
}

const KpiCard = ({ icon, label, value, sub, color, bg }: KpiProps) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
            <span className={`text-2xl ${color}`}>{icon}</span>
        </div>
        <div>
            <div className={`text-2xl font-bold ${color} leading-tight`}>{value}</div>
            <div className="text-sm text-gray-600 font-medium">{label}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
    </div>
)

const TokenRow = ({ t, selected, onSelect }: { t: TokenOverview; selected: boolean; onSelect: () => void }) => (
    <button
        onClick={onSelect}
        className={`
            w-full text-left p-4 rounded-xl border transition-all
            ${selected ? 'border-blue-300 bg-blue-50/60 ring-2 ring-blue-200/40' : 'border-gray-100 bg-white hover:border-gray-200'}
        `}
    >
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <span className="text-base">{PLATFORM_ICON[t.platform]}</span>
                <span className="font-semibold text-sm text-gray-800">{t.name}</span>
                <span className="text-xs text-gray-400">{PLATFORM_LABELS[t.platform]}</span>
            </div>
            {!t.is_active && (
                <span className="text-[11px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Nofaol</span>
            )}
        </div>
        <div className="grid grid-cols-4 gap-2">
            {[
                { label: "Ko'rishlar", value: t.impressions.toLocaleString(), color: 'text-gray-700' },
                { label: 'Clicklar', value: t.clicks.toLocaleString(), color: 'text-blue-600' },
                { label: 'Lidlar', value: t.leads, color: 'text-emerald-600' },
                { label: 'CTR', value: `${t.ctr}%`, color: 'text-violet-600' },
            ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                    <div className={`text-sm font-bold ${color}`}>{value}</div>
                    <div className="text-[11px] text-gray-400">{label}</div>
                </div>
            ))}
        </div>
    </button>
)

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
            <div className="font-semibold text-gray-600 mb-2">{label}</div>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-500">{p.name}:</span>
                    <span className="font-bold text-gray-700">{p.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    )
}

const TargetingDashboard = () => {
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const { data: overviewData, isLoading: overviewLoading } = useIntegrationsOverview()
    const { data: tokensData } = useWebhookTokens()
    const { data: statsData, isLoading: statsLoading } = useTokenStats(selectedId ?? 0)

    const overview = overviewData?.data
    const tokens   = overviewData?.data?.tokens ?? []
    const stats    = statsData?.data ?? []

    const selectedToken = tokens.find((t) => t.id === selectedId) ?? tokens[0]

    const chartData = stats.map((row) => ({
        date:        dayjs(row.date).format('DD MMM'),
        "Ko'rishlar": row.impressions,
        Clicklar:    row.clicks,
        Lidlar:      row.leads,
    }))

    return (
        <div className="p-6 bg-gray-50/50 min-h-full space-y-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Targeting paneli</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                    Reklama kampaniyalaringiz samaradorligi
                </p>
            </div>

            {/* KPI */}
            {overviewLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
                    ))}
                </div>
            ) : overview ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        icon={<HiEye />}
                        label="Jami ko'rishlar"
                        value={overview.total_impressions.toLocaleString()}
                        sub="Barcha kampaniyalar"
                        color="text-gray-700"
                        bg="bg-gray-100"
                    />
                    <KpiCard
                        icon={<HiCursorClick />}
                        label="Jami clicklar"
                        value={overview.total_clicks.toLocaleString()}
                        sub={`CTR: ${overview.avg_ctr}%`}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <KpiCard
                        icon={<HiUserAdd />}
                        label="Jami lidlar"
                        value={overview.total_leads}
                        sub="Webhookdan kelgan"
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                    <KpiCard
                        icon={<HiTrendingUp />}
                        label="O'rtacha CTR"
                        value={`${overview.avg_ctr}%`}
                        sub="Click / Ko'rish"
                        color="text-violet-600"
                        bg="bg-violet-50"
                    />
                </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Token list */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Kampaniyalar</h3>
                    {tokens.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center text-gray-300 text-sm">
                            Hech qanday webhook yo'q
                        </div>
                    ) : (
                        tokens.map((t) => (
                            <TokenRow
                                key={t.id}
                                t={t}
                                selected={selectedId === t.id}
                                onSelect={() => setSelectedId(t.id)}
                            />
                        ))
                    )}
                </div>

                {/* Detail charts */}
                <div className="lg:col-span-2 space-y-4">
                    {!selectedId && tokens.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 py-16 flex items-center justify-center text-gray-300 text-sm">
                            Kampaniya tanlang
                        </div>
                    ) : selectedId ? (
                        <>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                    {selectedToken?.name} — Oxirgi 30 kun
                                </h3>
                                {statsLoading ? (
                                    <div className="h-48 animate-pulse bg-gray-50 rounded-xl" />
                                ) : chartData.every((r) => r["Ko'rishlar"] === 0 && r.Clicklar === 0 && r.Lidlar === 0) ? (
                                    <Empty description="Statistika yo'q" className="py-8" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="imp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="clk" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={32} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                            <Area type="monotone" dataKey="Ko'rishlar" stroke="#94a3b8" fill="url(#imp)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="Clicklar" stroke="#3b82f6" fill="url(#clk)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Kunlik lidlar</h3>
                                {statsLoading ? (
                                    <div className="h-32 animate-pulse bg-gray-50 rounded-xl" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={140}>
                                        <BarChart data={chartData} barCategoryGap="35%">
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="Lidlar" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Summary metrics */}
                            {selectedToken && (
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Jami ko'rishlar", value: selectedToken.impressions.toLocaleString(), color: 'text-gray-700' },
                                        { label: 'Jami clicklar', value: selectedToken.clicks.toLocaleString(), color: 'text-blue-600' },
                                        { label: 'Jami lidlar', value: selectedToken.leads, color: 'text-emerald-600' },
                                        { label: 'CTR', value: `${selectedToken.ctr}%`, color: 'text-violet-600' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                                            <div className={`text-xl font-bold ${color}`}>{value}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 py-16 flex items-center justify-center text-gray-300 text-sm">
                            Webhook token yarating
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TargetingDashboard
