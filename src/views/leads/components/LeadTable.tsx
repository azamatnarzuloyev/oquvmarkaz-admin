import { useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Tag, Tooltip, Button, Empty } from 'antd'
import { HiPencil, HiChevronUp, HiChevronDown } from 'react-icons/hi'
import { FaInstagram, FaTelegram, FaGlobe, FaUsers } from 'react-icons/fa'
import { HiQuestionMarkCircle } from 'react-icons/hi'
import dayjs from 'dayjs'
import type { Lead, LeadStatus, LeadSource } from '../types'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS } from '../types'
import useResponsive from '@/utils/hooks/useResponsive'

const SOURCE_ICON: Record<LeadSource, React.ReactNode> = {
    instagram: <FaInstagram className="text-pink-500" />,
    telegram:  <FaTelegram className="text-sky-500" />,
    referral:  <FaUsers className="text-violet-500" />,
    website:   <FaGlobe className="text-emerald-500" />,
    other:     <HiQuestionMarkCircle className="text-gray-400" />,
}

const STATUS_TAG_COLOR: Record<LeadStatus, string> = {
    new:       'blue',
    no_answer: 'default',
    thinking:  'orange',
    trial:     'purple',
    converted: 'green',
    lost:      'red',
}

interface LeadTableProps {
    leads: Lead[]
    loading: boolean
    onEdit: (lead: Lead) => void
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
}

const LeadTable = ({ leads, loading, onEdit, total, page, pageSize, onPageChange }: LeadTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const { smaller } = useResponsive()
    const isMobile = smaller.md

    const columns = useMemo<ColumnDef<Lead>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                size: 48,
                cell: ({ row }) => (
                    <span className="text-gray-400 text-xs font-mono">
                        {(page - 1) * pageSize + row.index + 1}
                    </span>
                ),
            },
            {
                accessorKey: 'full_name',
                header: 'Ism familiya',
                cell: ({ row }) => {
                    const lead = row.original
                    const initials = lead.full_name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    return (
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {initials}
                            </div>
                            <div>
                                <div className="font-medium text-gray-800 text-sm leading-tight">
                                    {lead.full_name}
                                </div>
                                <div className="text-xs text-gray-400">{lead.phone}</div>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: 'status',
                header: 'Holat',
                size: 140,
                cell: ({ getValue }) => {
                    const s = getValue<LeadStatus>()
                    return (
                        <Tag color={STATUS_TAG_COLOR[s]} className="text-xs">
                            {LEAD_STATUS_LABELS[s]}
                        </Tag>
                    )
                },
            },
            {
                accessorKey: 'source',
                header: 'Manba',
                size: 120,
                meta: { hideMobile: true },
                cell: ({ getValue }) => {
                    const s = getValue<LeadSource>()
                    return (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            {SOURCE_ICON[s]}
                            <span className="text-xs">{LEAD_SOURCE_LABELS[s]}</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: 'assigned_to_name',
                header: "Mas'ul",
                size: 140,
                meta: { hideMobile: true },
                cell: ({ getValue }) => {
                    const name = getValue<string>()
                    return name ? (
                        <span className="text-xs text-gray-600">{name}</span>
                    ) : (
                        <span className="text-xs text-gray-300">—</span>
                    )
                },
            },
            {
                accessorKey: 'trial_date',
                header: 'Sinov dars',
                size: 110,
                meta: { hideMobile: true },
                cell: ({ getValue }) => {
                    const d = getValue<string | null>()
                    return d ? (
                        <span className="text-xs text-violet-600 font-medium">
                            {dayjs(d).format('DD.MM.YYYY')}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-300">—</span>
                    )
                },
            },
            {
                accessorKey: 'created_at',
                header: "Qo'shilgan",
                size: 110,
                enableSorting: true,
                meta: { hideMobile: true },
                cell: ({ getValue }) => (
                    <span className="text-xs text-gray-400">
                        {dayjs(getValue<string>()).format('DD.MM.YYYY')}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: '',
                size: 48,
                cell: ({ row }) => (
                    <Tooltip title="Tahrirlash">
                        <Button
                            size="small"
                            type="text"
                            icon={<HiPencil />}
                            className="text-gray-400 hover:text-blue-500"
                            onClick={() => onEdit(row.original)}
                        />
                    </Tooltip>
                ),
            },
        ],
        [page, pageSize, onEdit],
    )

    const table = useReactTable({
        data: leads,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(total / pageSize),
    })

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 animate-pulse">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                        <div className="flex-1">
                            <div className="h-3.5 bg-gray-200 rounded w-36 mb-1.5" />
                            <div className="h-3 bg-gray-100 rounded w-24" />
                        </div>
                        <div className="h-5 bg-gray-100 rounded w-20" />
                        <div className="h-4 bg-gray-100 rounded w-16" />
                        <div className="h-4 bg-gray-100 rounded w-16" />
                        <div className="h-4 bg-gray-100 rounded w-20" />
                        <div className="h-4 bg-gray-100 rounded w-20" />
                    </div>
                ))}
            </div>
        )
    }

    if (leads.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 py-16">
                <Empty description="Lid topilmadi" />
            </div>
        )
    }

    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id} className="border-b border-gray-100 bg-gray-50/60">
                                {hg.headers
                                    .filter((h) => !(isMobile && (h.column.columnDef.meta as any)?.hideMobile))
                                    .map((header) => (
                                    <th
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                        className={`
                                            px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
                                            ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-700' : ''}
                                        `}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <span className="text-gray-300">
                                                    {header.column.getIsSorted() === 'asc'  ? <HiChevronUp className="text-blue-500" /> :
                                                     header.column.getIsSorted() === 'desc' ? <HiChevronDown className="text-blue-500" /> :
                                                     <HiChevronDown />}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                            >
                                {row.getVisibleCells()
                                    .filter((cell) => !(isMobile && (cell.column.columnDef.meta as any)?.hideMobile))
                                    .map((cell) => (
                                    <td key={cell.id} className="px-4 py-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                        Jami <span className="font-semibold text-gray-600">{total}</span> ta lid
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(page - 1, pageSize)}
                            disabled={page <= 1}
                            className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            ‹
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            const p = totalPages <= 7
                                ? i + 1
                                : page <= 4
                                    ? i + 1
                                    : page >= totalPages - 3
                                        ? totalPages - 6 + i
                                        : page - 3 + i
                            return (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p, pageSize)}
                                    className={`
                                        px-2.5 py-1 text-xs rounded-lg border transition-colors
                                        ${p === page
                                            ? 'bg-blue-500 border-blue-500 text-white font-semibold'
                                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'}
                                    `}
                                >
                                    {p}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => onPageChange(page + 1, pageSize)}
                            disabled={page >= totalPages}
                            className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            ›
                        </button>
                    </div>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageChange(1, Number(e.target.value))}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none cursor-pointer"
                    >
                        {[10, 20, 50].map((s) => (
                            <option key={s} value={s}>{s} ta</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}

export default LeadTable
