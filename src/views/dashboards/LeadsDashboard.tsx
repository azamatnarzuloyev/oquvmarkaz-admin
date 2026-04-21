import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    FunnelChart, Funnel, LabelList,
} from 'recharts'
import dayjs from 'dayjs'
import { useLeadDashboard } from '../leads/hooks/useLeads'
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '../leads/types'
import type { LeadStatus, LeadSource } from '../leads/types'

const STATUS_COLORS: Record<LeadStatus, string> = {
    new:       '#3b82f6',
    no_answer: '#94a3b8',
    thinking:  '#f97316',
    trial:     '#8b5cf6',
    converted: '#10b981',
    lost:      '#ef4444',
}

const SOURCE_COLORS: Record<LeadSource, string> = {
    instagram: '#ec4899',
    telegram:  '#0ea5e9',
    referral:  '#8b5cf6',
    website:   '#10b981',
    other:     '#94a3b8',
}

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1`}>
        <div className={`text-2xl font-bold`} style={{ color }}>{value}</div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
)

const LeadsDashboard = () => {
    const { data, isLoading } = useLeadDashboard()
    const d = data?.data

    if (isLoading) {
        return (
            <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
                ))}
            </div>
        )
    }

    if (!d) return null

    const funnelData = (['new', 'thinking', 'trial', 'converted'] as LeadStatus[]).map((s) => ({
        name: LEAD_STATUS_LABELS[s],
        value: d.by_status[s] ?? 0,
        fill: STATUS_COLORS[s],
    }))

    const sourceData = Object.entries(d.by_source).map(([source, count]) => ({
        name: LEAD_SOURCE_LABELS[source as LeadSource] ?? source,
        value: count ?? 0,
        fill: SOURCE_COLORS[source as LeadSource] ?? '#94a3b8',
    }))

    const weeklyData = d.weekly_new.map((item) => ({
        date: dayjs(item.date).format('DD MMM'),
        count: item.count,
    }))

    const totalWeek = d.weekly_new.reduce((sum, i) => sum + i.count, 0)

    return (
        <div className="p-6 space-y-6 bg-gray-50/50 min-h-full">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-400 mt-0.5">Lidlar statistikasi va analitika</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Jami lidlar"
                    value={d.total}
                    sub="Barcha vaqt"
                    color="#3b82f6"
                />
                <StatCard
                    label="To'lov qildi"
                    value={d.by_status.converted ?? 0}
                    sub={`Konversiya: ${d.conversion_rate}%`}
                    color="#10b981"
                />
                <StatCard
                    label="Joriy hafta"
                    value={totalWeek}
                    sub="Yangi lidlar"
                    color="#8b5cf6"
                />
                <StatCard
                    label="Yo'qotildi"
                    value={d.by_status.lost ?? 0}
                    sub="Jami yo'qotilgan"
                    color="#ef4444"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly bar chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Oxirgi 7 kun — yangi lidlar</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData} barCategoryGap="30%">
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                width={24}
                            />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar dataKey="count" name="Yangi lid" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Source pie chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Manba bo'yicha</h3>
                    {sourceData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Ma'lumot yo'q</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {sourceData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Status funnel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Savdo hunisi</h3>
                <div className="flex items-center gap-3 flex-wrap">
                    {funnelData.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="flex flex-col items-center">
                                <div
                                    className="rounded-xl flex items-center justify-center font-bold text-white text-lg"
                                    style={{
                                        backgroundColor: item.fill,
                                        width: Math.max(64, 120 - i * 14),
                                        height: 56,
                                    }}
                                >
                                    {item.value}
                                </div>
                                <span className="text-xs text-gray-400 mt-1 text-center">{item.name}</span>
                            </div>
                            {i < funnelData.length - 1 && (
                                <div className="text-gray-200 text-xl mb-5">›</div>
                            )}
                        </div>
                    ))}

                    <div className="ml-auto text-right">
                        <div className="text-2xl font-bold text-emerald-500">{d.conversion_rate}%</div>
                        <div className="text-xs text-gray-400">Konversiya</div>
                    </div>
                </div>
            </div>

            {/* Status breakdown table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Holat bo'yicha taqsimlash</h3>
                <div className="space-y-2">
                    {(Object.entries(d.by_status) as [LeadStatus, number][])
                        .sort((a, b) => b[1] - a[1])
                        .map(([status, count]) => {
                            const pct = d.total > 0 ? Math.round((count / d.total) * 100) : 0
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-36 truncate">
                                        {LEAD_STATUS_LABELS[status]}
                                    </span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 w-8 text-right">{count}</span>
                                    <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                                </div>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}

export default LeadsDashboard
