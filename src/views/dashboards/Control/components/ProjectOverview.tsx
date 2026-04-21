import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import dayjs from 'dayjs'
import { useLeadDashboard } from '@/views/leads/hooks/useLeads'
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '@/views/leads/types'
import type { LeadStatus, LeadSource } from '@/views/leads/types'
import {
    HiUsers, HiCheckCircle, HiTrendingUp, HiXCircle,
} from 'react-icons/hi'

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

interface KpiCardProps {
    icon: React.ReactNode
    label: string
    value: string | number
    sub?: string
    iconBg: string
    iconColor: string
}

const KpiCard = ({ icon, label, value, sub, iconBg, iconColor }: KpiCardProps) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <span className={`text-2xl ${iconColor}`}>{icon}</span>
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-900 leading-tight">{value}</div>
            <div className="text-sm text-gray-600 font-medium">{label}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
    </div>
)

const ProjectOverview = () => {
    const { data, isLoading } = useLeadDashboard()
    const d = data?.data

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (!d) return null

    const weeklyData = d.weekly_new.map((item) => ({
        date: dayjs(item.date).format('DD MMM'),
        count: item.count,
    }))

    const sourceData = Object.entries(d.by_source)
        .filter(([, v]) => (v ?? 0) > 0)
        .map(([source, count]) => ({
            name: LEAD_SOURCE_LABELS[source as LeadSource] ?? source,
            value: count ?? 0,
            fill: SOURCE_COLORS[source as LeadSource] ?? '#94a3b8',
        }))

    const totalWeek = d.weekly_new.reduce((s, i) => s + i.count, 0)

    return (
        <div className="space-y-6">
            {/* KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<HiUsers />}
                    label="Jami lidlar"
                    value={d.total}
                    sub="Barcha vaqt uchun"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                />
                <KpiCard
                    icon={<HiCheckCircle />}
                    label="To'lov qildi"
                    value={d.by_status.converted ?? 0}
                    sub={`Konversiya: ${d.conversion_rate}%`}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-500"
                />
                <KpiCard
                    icon={<HiTrendingUp />}
                    label="Joriy hafta"
                    value={totalWeek}
                    sub="Yangi lidlar (7 kun)"
                    iconBg="bg-violet-50"
                    iconColor="text-violet-500"
                />
                <KpiCard
                    icon={<HiXCircle />}
                    label="Yo'qotildi"
                    value={d.by_status.lost ?? 0}
                    sub="Jami yo'qotilgan"
                    iconBg="bg-red-50"
                    iconColor="text-red-400"
                />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Oxirgi 7 kun — yangi lidlar</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData} barCategoryGap="30%">
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} cursor={{ fill: '#f1f5f9' }} />
                            <Bar dataKey="count" name="Yangi lid" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Source pie */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Manba bo'yicha</h3>
                    {sourceData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Ma'lumot yo'q</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {sourceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Savdo hunisi */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Savdo hunisi</h3>
                <div className="space-y-2">
                    {(Object.entries(d.by_status) as [LeadStatus, number][])
                        .sort((a, b) => b[1] - a[1])
                        .map(([status, count]) => {
                            const pct = d.total > 0 ? Math.round((count / d.total) * 100) : 0
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-36 truncate">{LEAD_STATUS_LABELS[status]}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 w-6 text-right">{count}</span>
                                    <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                                </div>
                            )
                        })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Umumiy konversiya</span>
                    <span className="text-lg font-bold text-emerald-500">{d.conversion_rate}%</span>
                </div>
            </div>
        </div>
    )
}

export default ProjectOverview
