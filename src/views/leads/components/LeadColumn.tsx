import { Droppable } from '@hello-pangea/dnd'
import type { Lead, LeadStatus } from '../types'
import { LEAD_STATUS_LABELS } from '../types'
import LeadCard from './LeadCard'

const COLUMN_THEME: Record<LeadStatus, {
    dot: string
    badge: string
    dropBg: string
    border: string
    emptyIcon: string
}> = {
    new:       { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-600',       dropBg: 'bg-blue-50/60',    border: 'border-blue-200',    emptyIcon: '🆕' },
    no_answer: { dot: 'bg-slate-400',   badge: 'bg-slate-50 text-slate-500',     dropBg: 'bg-slate-50/60',   border: 'border-slate-200',   emptyIcon: '📵' },
    thinking:  { dot: 'bg-orange-400',  badge: 'bg-orange-50 text-orange-600',   dropBg: 'bg-orange-50/60',  border: 'border-orange-200',  emptyIcon: '🤔' },
    trial:     { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-600',   dropBg: 'bg-violet-50/60',  border: 'border-violet-200',  emptyIcon: '📅' },
    converted: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', dropBg: 'bg-emerald-50/60', border: 'border-emerald-200', emptyIcon: '✅' },
    lost:      { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-500',         dropBg: 'bg-red-50/40',     border: 'border-red-200',     emptyIcon: '❌' },
}

interface LeadColumnProps {
    status: LeadStatus
    leads: Lead[]
    onEdit: (lead: Lead) => void
    onDetail: (lead: Lead) => void
    onMove?: (lead: Lead) => void
    isMobile?: boolean
}

const LeadColumn = ({ status, leads, onEdit, onDetail, onMove, isMobile }: LeadColumnProps) => {
    const theme = COLUMN_THEME[status]

    return (
        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-64 flex-shrink-0'}`}>
            {/* Column header — mobilda yashirin (tab da ko'rsatilgan) */}
            {!isMobile && (
                <div className="flex items-center justify-between mb-2 px-0.5">
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} shadow-sm`} />
                        <span className="font-semibold text-[13px] text-gray-700">
                            {LEAD_STATUS_LABELS[status]}
                        </span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
                        {leads.length}
                    </span>
                </div>
            )}

            {/* Drop zone */}
            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                            flex-1 rounded-xl p-2
                            border-2 border-dashed transition-all duration-150
                            ${isMobile ? 'min-h-[60vh]' : 'min-h-32'}
                            ${snapshot.isDraggingOver
                                ? `${theme.dropBg} ${theme.border} scale-[1.01]`
                                : 'bg-gray-50/80 border-transparent'
                            }
                        `}
                    >
                        {leads.map((lead, index) => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                index={index}
                                onEdit={onEdit}
                                onDetail={onDetail}
                                onMove={onMove}
                                isMobile={isMobile}
                            />
                        ))}
                        {provided.placeholder}

                        {leads.length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <span className="text-3xl opacity-20">{theme.emptyIcon}</span>
                                <span className="text-xs text-gray-300 font-medium">Bo'sh</span>
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    )
}

export default LeadColumn
