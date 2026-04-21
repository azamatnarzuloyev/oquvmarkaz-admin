import { Draggable } from '@hello-pangea/dnd'
import { Tooltip } from 'antd'
import { HiPhone, HiCalendar, HiPencil, HiSwitchHorizontal } from 'react-icons/hi'
import { FaInstagram, FaTelegram, FaGlobe, FaUsers } from 'react-icons/fa'
import { HiQuestionMarkCircle } from 'react-icons/hi'
import dayjs from 'dayjs'
import type { Lead, LeadSource } from '../types'
import { LEAD_SOURCE_LABELS } from '../types'

const SOURCE_ICON: Record<LeadSource, React.ReactNode> = {
    instagram: <FaInstagram size={11} className="text-pink-500" />,
    telegram:  <FaTelegram  size={11} className="text-sky-500"  />,
    referral:  <FaUsers     size={11} className="text-green-500"/>,
    website:   <FaGlobe     size={11} className="text-blue-500" />,
    other:     <HiQuestionMarkCircle size={12} className="text-gray-400" />,
}

const SOURCE_BG: Record<LeadSource, string> = {
    instagram: 'bg-pink-50 text-pink-600 border-pink-100',
    telegram:  'bg-sky-50 text-sky-600 border-sky-100',
    referral:  'bg-green-50 text-green-600 border-green-100',
    website:   'bg-blue-50 text-blue-600 border-blue-100',
    other:     'bg-gray-50 text-gray-500 border-gray-100',
}

const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const AVATAR_COLORS = [
    'from-violet-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500',
]

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]

interface LeadCardProps {
    lead: Lead
    index: number
    onEdit: (lead: Lead) => void
    onDetail: (lead: Lead) => void
    onMove?: (lead: Lead) => void
    isMobile?: boolean
}

const LeadCard = ({ lead, index, onEdit, onDetail, onMove, isMobile }: LeadCardProps) => {
    return (
        <Draggable draggableId={String(lead.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...(isMobile ? {} : provided.dragHandleProps)}
                    className={`
                        group relative bg-white rounded-xl mb-2
                        border border-gray-100
                        transition-all duration-150
                        ${isMobile ? 'cursor-default active:scale-[0.99]' : 'cursor-grab active:cursor-grabbing'}
                        ${snapshot.isDragging
                            ? 'shadow-xl rotate-1 scale-105 border-blue-200 ring-2 ring-blue-300/40'
                            : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
                        }
                    `}
                >
                    {/* Desktop: edit button hover da */}
                    {!isMobile && (
                        <Tooltip title="Tahrirlash">
                            <button
                                className="
                                    absolute top-2.5 right-2.5
                                    opacity-0 group-hover:opacity-100
                                    w-6 h-6 rounded-md
                                    flex items-center justify-center
                                    bg-gray-100 hover:bg-blue-100
                                    text-gray-400 hover:text-blue-600
                                    transition-all duration-150
                                "
                                onClick={(e) => { e.stopPropagation(); onEdit(lead) }}
                            >
                                <HiPencil size={12} />
                            </button>
                        </Tooltip>
                    )}

                    <div
                        className={`p-3 ${isMobile ? 'pb-2' : ''}`}
                        onClick={() => !isMobile && onDetail(lead)}
                    >
                        {/* Avatar + Ism */}
                        <div className={`flex items-center gap-2.5 ${isMobile ? '' : 'pr-6'}`}>
                            <div className={`
                                rounded-lg flex-shrink-0
                                bg-gradient-to-br ${getAvatarColor(lead.id)}
                                flex items-center justify-center
                                text-white font-bold shadow-sm
                                ${isMobile ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'}
                            `}>
                                {getInitials(lead.full_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`font-semibold text-gray-800 leading-tight truncate ${isMobile ? 'text-sm' : 'text-[13px]'}`}>
                                    {lead.full_name}
                                </div>
                                {isMobile && (
                                    <a
                                        href={`tel:${lead.phone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-blue-500 font-mono"
                                    >
                                        {lead.phone}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Telefon — faqat desktop */}
                        {!isMobile && (
                            <div className="flex items-center gap-1.5 mt-2 ml-0.5">
                                <HiPhone size={12} className="text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-500 font-mono tracking-wide">
                                    {lead.phone}
                                </span>
                            </div>
                        )}

                        {/* Footer: manba + sana */}
                        <div className="flex items-center justify-between mt-2">
                            <span className={`
                                inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                                text-[11px] font-medium border
                                ${SOURCE_BG[lead.source] ?? SOURCE_BG.other}
                            `}>
                                {SOURCE_ICON[lead.source]}
                                {LEAD_SOURCE_LABELS[lead.source]}
                            </span>

                            {lead.trial_date ? (
                                <span className="flex items-center gap-1 text-[11px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100">
                                    <HiCalendar size={11} />
                                    {dayjs(lead.trial_date).format('DD MMM')}
                                </span>
                            ) : (
                                <span className="text-[11px] text-gray-300">
                                    {dayjs(lead.created_at).format('DD.MM')}
                                </span>
                            )}
                        </div>

                        {/* Mas'ul */}
                        {lead.assigned_to_name && (
                            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1">
                                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex-shrink-0" />
                                <span className="text-[11px] text-gray-400 truncate">
                                    {lead.assigned_to_name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Mobil action buttons */}
                    {isMobile && (
                        <div className="flex border-t border-gray-50">
                            <button
                                onClick={() => onDetail(lead)}
                                className="flex-1 py-2.5 text-xs text-gray-500 font-medium hover:bg-gray-50 transition-colors rounded-bl-xl"
                            >
                                Batafsil
                            </button>
                            <div className="w-px bg-gray-50" />
                            <button
                                onClick={() => onEdit(lead)}
                                className="flex-1 py-2.5 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                            >
                                <HiPencil size={12} />
                                Tahrirlash
                            </button>
                            <div className="w-px bg-gray-50" />
                            <button
                                onClick={() => onMove?.(lead)}
                                className="flex-1 py-2.5 text-xs text-violet-500 font-medium hover:bg-violet-50 transition-colors rounded-br-xl flex items-center justify-center gap-1"
                            >
                                <HiSwitchHorizontal size={12} />
                                Ko'chirish
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    )
}

export default LeadCard
