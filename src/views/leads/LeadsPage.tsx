import { useState } from 'react'
import { Button, Input, Select, DatePicker, Alert, Tooltip, Drawer } from 'antd'
import { HiPlus, HiSearch, HiRefresh, HiFilter, HiViewBoards, HiViewList } from 'react-icons/hi'
import useResponsive from '@/utils/hooks/useResponsive'
import dayjs from 'dayjs'
import { useLeads, useLeadFunnel } from './hooks/useLeads'
import KanbanBoard from './components/KanbanBoard'
import LeadTable from './components/LeadTable'
import LeadForm from './components/LeadForm'
import LeadDetail from './components/LeadDetail'
import type { Lead, LeadSource, LeadStatus } from './types'
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, LEAD_STATUSES } from './types'
import { getApiError } from '@/service/get.service'

const { RangePicker } = DatePicker

const SOURCE_OPTIONS = [
    { value: '', label: 'Barcha manbalar' },
    ...Object.entries(LEAD_SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l })),
]

const STATUS_OPTIONS = [
    { value: '', label: 'Barcha holatlar' },
    ...Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
]

const STAT_CONFIG: Record<LeadStatus, { bg: string; border: string; text: string; dot: string }> = {
    new:       { bg: 'bg-blue-50',    border: 'border-blue-100',   text: 'text-blue-600',    dot: 'bg-blue-500'   },
    no_answer: { bg: 'bg-slate-50',   border: 'border-slate-200',  text: 'text-slate-500',   dot: 'bg-slate-400'  },
    thinking:  { bg: 'bg-orange-50',  border: 'border-orange-100', text: 'text-orange-600',  dot: 'bg-orange-400' },
    trial:     { bg: 'bg-violet-50',  border: 'border-violet-100', text: 'text-violet-600',  dot: 'bg-violet-500' },
    converted: { bg: 'bg-emerald-50', border: 'border-emerald-100',text: 'text-emerald-700', dot: 'bg-emerald-500'},
    lost:      { bg: 'bg-red-50',     border: 'border-red-100',    text: 'text-red-500',     dot: 'bg-red-400'    },
}

const LeadsPage = () => {
    const { smaller } = useResponsive()
    const isMobile = smaller.md

    const [view, setView]               = useState<'kanban' | 'table'>('kanban')
    const [formOpen, setFormOpen]         = useState(false)
    const [editingLead, setEditingLead]   = useState<Lead | null>(null)
    const [detailOpen, setDetailOpen]     = useState(false)
    const [detailLead, setDetailLead]     = useState<Lead | null>(null)
    const [search, setSearch]           = useState('')
    const [source, setSource]           = useState<LeadSource | ''>('')
    const [status, setStatus]           = useState<LeadStatus | ''>('')
    const [dateRange, setDateRange]     = useState<[string, string] | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [page, setPage]               = useState(1)
    const [pageSize, setPageSize]       = useState(20)

    const queryParams: Record<string, string | number> = {}
    if (search)         queryParams.search    = search
    if (source)         queryParams.source    = source
    if (status)         queryParams.status    = status
    if (dateRange?.[0]) queryParams.date_from = dateRange[0]
    if (dateRange?.[1]) queryParams.date_to   = dateRange[1]
    if (view === 'table') {
        queryParams.page      = page
        queryParams.page_size = pageSize
    }

    const hasFilter = !!(search || source || status || dateRange)

    const { data, isLoading, error, refetch } = useLeads(
        Object.keys(queryParams).length ? queryParams : undefined,
    )
    const { data: funnelData } = useLeadFunnel()

    const leads  = data?.data ?? []
    const funnel = funnelData?.data
    const total  = data?.meta?.total ?? 0

    const openCreate  = () => { setEditingLead(null); setFormOpen(true) }
    const openEdit    = (lead: Lead) => { setEditingLead(lead); setFormOpen(true) }
    const closeForm   = () => { setFormOpen(false); setEditingLead(null) }
    const openDetail  = (lead: Lead) => { setDetailLead(lead); setDetailOpen(true) }
    const closeDetail = () => { setDetailOpen(false); setDetailLead(null) }

    const handlePageChange = (newPage: number, newSize: number) => {
        if (newSize !== pageSize) { setPage(1); setPageSize(newSize) }
        else setPage(newPage)
    }

    const clearFilters = () => {
        setSearch(''); setSource(''); setStatus(''); setDateRange(null); setPage(1)
    }

    return (
        <div className="h-full flex flex-col bg-gray-50/50">

            {/* ── Page Header ── */}
            <div className={`bg-white border-b border-gray-100 shadow-sm ${isMobile ? 'px-4 pt-4 pb-3' : 'px-6 pt-5 pb-4'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`font-bold text-gray-900 tracking-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>
                            Lidlar
                        </h1>
                        {!isMobile && (
                            <p className="text-xs text-gray-400 mt-0.5">
                                Barcha potensial mijozlar va ularning holati
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle — faqat desktop */}
                        {!isMobile && (
                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                                <Tooltip title="Kanban">
                                    <button
                                        onClick={() => setView('kanban')}
                                        className={`p-1.5 rounded-md transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <HiViewBoards className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Jadval">
                                    <button
                                        onClick={() => setView('table')}
                                        className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <HiViewList className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            </div>
                        )}

                        <Tooltip title="Yangilash">
                            <Button
                                icon={<HiRefresh className={isLoading ? 'animate-spin' : ''} />}
                                onClick={() => refetch()}
                                className="text-gray-500"
                            />
                        </Tooltip>
                        <Tooltip title="Filtrlar">
                            <Button
                                icon={<HiFilter />}
                                onClick={() => setShowFilters((p) => !p)}
                                className={hasFilter ? 'text-blue-600 border-blue-300 bg-blue-50' : 'text-gray-500'}
                            >
                                {hasFilter && (
                                    <span className="ml-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 inline-flex items-center justify-center">
                                        !
                                    </span>
                                )}
                            </Button>
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<HiPlus />}
                            onClick={openCreate}
                            className="shadow-sm"
                        >
                            {!isMobile && 'Yangi lid'}
                        </Button>
                    </div>
                </div>

                {/* ── Stat cards ── */}
                {funnel && (
                    <div className={`mt-4 ${isMobile ? 'grid grid-cols-3 gap-1.5' : 'flex gap-2 flex-wrap'}`}>
                        {LEAD_STATUSES.map((s) => {
                            const cfg   = STAT_CONFIG[s]
                            const count = funnel.by_status[s] ?? 0
                            return (
                                <button
                                    key={s}
                                    onClick={() => { setStatus((prev) => prev === s ? '' : s); setPage(1) }}
                                    className={`
                                        flex items-center gap-1.5 rounded-lg border font-medium
                                        transition-all cursor-pointer
                                        ${isMobile ? 'px-2 py-2 text-xs flex-col items-center gap-0.5' : 'px-3 py-1.5 text-sm'}
                                        ${cfg.bg} ${cfg.border} ${cfg.text}
                                        ${status === s ? 'ring-2 ring-offset-1 ring-current' : 'opacity-80 hover:opacity-100'}
                                    `}
                                >
                                    <span className={`rounded-full ${cfg.dot} ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
                                    <span className={isMobile ? 'text-[10px] leading-tight text-center' : ''}>{LEAD_STATUS_LABELS[s]}</span>
                                    <span className="font-bold">{count}</span>
                                </button>
                            )
                        })}
                        {!isMobile && funnel.total > 0 && (
                            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 self-center pr-1">
                                <span>Konversiya:</span>
                                <span className="font-bold text-emerald-600 text-sm">
                                    {funnel.conversion_rate}%
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Filters — desktop: inline row, mobile: drawer ── */}
            {isMobile ? (
                <Drawer
                    title="Filtrlar"
                    open={showFilters}
                    onClose={() => setShowFilters(false)}
                    placement="bottom"
                    height="auto"
                    destroyOnClose={false}
                    styles={{ body: { paddingBottom: '24px' } }}
                    footer={
                        <div className="flex gap-2">
                            {hasFilter && (
                                <Button block onClick={() => { clearFilters(); setShowFilters(false) }} danger>
                                    Tozalash
                                </Button>
                            )}
                            <Button type="primary" block onClick={() => setShowFilters(false)}>
                                Qo'llash
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-3">
                        <Input
                            prefix={<HiSearch className="text-gray-400" />}
                            placeholder="Ism yoki telefon..."
                            size="large"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            allowClear
                        />
                        <Select
                            className="w-full"
                            size="large"
                            value={source}
                            onChange={(v) => { setSource(v); setPage(1) }}
                            options={SOURCE_OPTIONS}
                            placeholder="Manba"
                        />
                        <Select
                            className="w-full"
                            size="large"
                            value={status}
                            onChange={(v) => { setStatus(v); setPage(1) }}
                            options={STATUS_OPTIONS}
                            placeholder="Holat"
                        />
                        <RangePicker
                            className="w-full"
                            size="large"
                            format="DD.MM.YYYY"
                            onChange={(_, strs) => {
                                setDateRange(strs[0] && strs[1] ? [
                                    dayjs(strs[0], 'DD.MM.YYYY').format('YYYY-MM-DD'),
                                    dayjs(strs[1], 'DD.MM.YYYY').format('YYYY-MM-DD'),
                                ] : null)
                                setPage(1)
                            }}
                        />
                        <div className="text-xs text-gray-400 text-center">{total} ta lid topildi</div>
                    </div>
                </Drawer>
            ) : showFilters && (
                <div className="px-6 py-3 bg-white border-b border-gray-100 flex flex-wrap gap-2 items-center">
                    <Input
                        prefix={<HiSearch className="text-gray-400" />}
                        placeholder="Ism yoki telefon..."
                        className="w-52"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        allowClear
                    />
                    <Select
                        className="w-44"
                        value={source}
                        onChange={(v) => { setSource(v); setPage(1) }}
                        options={SOURCE_OPTIONS}
                        placeholder="Manba"
                    />
                    <Select
                        className="w-44"
                        value={status}
                        onChange={(v) => { setStatus(v); setPage(1) }}
                        options={STATUS_OPTIONS}
                        placeholder="Holat"
                    />
                    <RangePicker
                        format="DD.MM.YYYY"
                        onChange={(_, strs) => {
                            setDateRange(strs[0] && strs[1] ? [
                                dayjs(strs[0], 'DD.MM.YYYY').format('YYYY-MM-DD'),
                                dayjs(strs[1], 'DD.MM.YYYY').format('YYYY-MM-DD'),
                            ] : null)
                            setPage(1)
                        }}
                    />
                    {hasFilter && (
                        <Button size="small" onClick={clearFilters} className="text-gray-400 hover:text-red-500">
                            Tozalash
                        </Button>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{total} ta lid topildi</span>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <Alert
                    type="error"
                    message={getApiError(error)}
                    className="mx-6 mt-4"
                    showIcon
                    closable
                />
            )}

            {/* ── Content ── */}
            <div className="flex-1 overflow-auto px-6 py-4">
                {view === 'kanban' ? (
                    <KanbanBoard leads={leads} loading={isLoading} onEdit={openEdit} onDetail={openDetail} />
                ) : (
                    <LeadTable
                        leads={leads}
                        loading={isLoading}
                        onEdit={openEdit}
                        total={total}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <LeadForm open={formOpen} lead={editingLead} onClose={closeForm} />
            <LeadDetail open={detailOpen} lead={detailLead} onClose={closeDetail} onEdit={openEdit} />
        </div>
    )
}

export default LeadsPage
