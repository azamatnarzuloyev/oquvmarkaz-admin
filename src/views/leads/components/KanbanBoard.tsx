import { useState, useRef } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { Modal, Input, message, Drawer, Button, Select } from 'antd'
import type { Lead, LeadStatus } from '../types'
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '../types'
import { useChangeLeadStatus } from '../hooks/useLeads'
import LeadColumn from './LeadColumn'
import { getApiError } from '@/service/get.service'
import useResponsive from '@/utils/hooks/useResponsive'

const STATUS_DOT: Record<LeadStatus, string> = {
    new:       'bg-blue-500',
    no_answer: 'bg-slate-400',
    thinking:  'bg-orange-400',
    trial:     'bg-violet-500',
    converted: 'bg-emerald-500',
    lost:      'bg-red-400',
}

interface KanbanBoardProps {
    leads: Lead[]
    loading: boolean
    onEdit: (lead: Lead) => void
    onDetail: (lead: Lead) => void
}

const KanbanBoard = ({ leads, loading, onEdit, onDetail }: KanbanBoardProps) => {
    const changeStatus = useChangeLeadStatus()
    const { smaller } = useResponsive()
    const isMobile = smaller.md

    const [lostModal, setLostModal]   = useState(false)
    const [lostReason, setLostReason] = useState('')
    const pendingRef = useRef<{ id: number } | null>(null)

    // Mobil: aktiv tab holat
    const [activeTab, setActiveTab] = useState<LeadStatus>('new')

    // Mobil: status o'zgartirish drawer
    const [moveDrawer, setMoveDrawer]   = useState(false)
    const [movingLead, setMovingLead]   = useState<Lead | null>(null)
    const [moveTarget, setMoveTarget]   = useState<LeadStatus>('thinking')

    const byStatus = LEAD_STATUSES.reduce<Record<LeadStatus, Lead[]>>(
        (acc, s) => {
            acc[s] = leads.filter((l) => l.status === s)
            return acc
        },
        { new: [], no_answer: [], thinking: [], trial: [], converted: [], lost: [] },
    )

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result
        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const newStatus = destination.droppableId as LeadStatus
        const leadId    = Number(draggableId)

        if (newStatus === 'lost') {
            pendingRef.current = { id: leadId }
            setLostReason('')
            setLostModal(true)
            return
        }
        changeStatus.mutate({ id: leadId, status: newStatus })
    }

    const confirmLost = async () => {
        if (!lostReason.trim()) { message.warning('Sabab kiriting'); return }
        const { id } = pendingRef.current!
        try {
            await changeStatus.mutateAsync({ id, status: 'lost', lost_reason: lostReason.trim() })
            setLostModal(false)
        } catch (err) {
            message.error(getApiError(err))
        }
    }

    const cancelLost = () => { setLostModal(false); pendingRef.current = null }

    // Mobil: leadni boshqa statusga o'tkazish
    const openMoveDrawer = (lead: Lead) => {
        const others = LEAD_STATUSES.filter((s) => s !== lead.status && s !== 'lost')
        setMovingLead(lead)
        setMoveTarget(others[0] ?? 'thinking')
        setMoveDrawer(true)
    }

    const confirmMove = async () => {
        if (!movingLead) return
        if (moveTarget === 'lost') {
            pendingRef.current = { id: movingLead.id }
            setLostReason('')
            setMoveDrawer(false)
            setLostModal(true)
            return
        }
        try {
            await changeStatus.mutateAsync({ id: movingLead.id, status: moveTarget })
            setMoveDrawer(false)
            message.success('Holat o\'zgartirildi')
        } catch (err) {
            message.error(getApiError(err))
        }
    }

    if (loading) {
        return (
            <div className={isMobile ? 'space-y-3' : 'flex gap-3 overflow-x-auto pb-4'}>
                {(isMobile ? [activeTab] : LEAD_STATUSES).map((s) => (
                    <div key={s} className={isMobile ? 'w-full' : 'w-64 flex-shrink-0'}>
                        <div className="flex items-center justify-between mb-2 px-0.5">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-6 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2 min-h-32 border-2 border-dashed border-transparent">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white rounded-xl p-3 mb-2 shadow-sm animate-pulse">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                                        <div className="h-3.5 bg-gray-200 rounded w-28" />
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded w-32 mb-2" />
                                    <div className="h-5 bg-gray-100 rounded w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <>
            {isMobile ? (
                /* ─── MOBIL KO'RINISH ─── */
                <div className="flex flex-col gap-3">
                    {/* Status tabs — horizontal scroll */}
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                        {LEAD_STATUSES.map((s) => {
                            const cnt = byStatus[s].length
                            const isActive = activeTab === s
                            return (
                                <button
                                    key={s}
                                    onClick={() => setActiveTab(s)}
                                    className={`
                                        flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl
                                        text-xs font-semibold transition-all border
                                        ${isActive
                                            ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                            : 'bg-white text-gray-500 border-gray-200'}
                                    `}
                                >
                                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white/70' : STATUS_DOT[s]}`} />
                                    {LEAD_STATUS_LABELS[s]}
                                    <span className={`
                                        text-[11px] font-bold px-1.5 py-0.5 rounded-full
                                        ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}
                                    `}>
                                        {cnt}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Aktiv kolonna — bitta */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <LeadColumn
                            key={activeTab}
                            status={activeTab}
                            leads={byStatus[activeTab]}
                            onEdit={onEdit}
                            onDetail={onDetail}
                            onMove={openMoveDrawer}
                            isMobile
                        />
                    </DragDropContext>
                </div>
            ) : (
                /* ─── DESKTOP KO'RINISH ─── */
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-3 overflow-x-auto pb-4">
                        {LEAD_STATUSES.map((status) => (
                            <LeadColumn
                                key={status}
                                status={status}
                                leads={byStatus[status]}
                                onEdit={onEdit}
                                onDetail={onDetail}
                            />
                        ))}
                    </div>
                </DragDropContext>
            )}

            {/* Lost reason modal */}
            <Modal
                title={<div className="flex items-center gap-2"><span>❌</span><span>Yo'qotish sababi</span></div>}
                open={lostModal}
                onOk={confirmLost}
                onCancel={cancelLost}
                okText="Tasdiqlash"
                cancelText="Bekor qilish"
                okButtonProps={{ danger: true, loading: changeStatus.isPending }}
                destroyOnClose
                width={Math.min(400, window.innerWidth - 32)}
            >
                <p className="text-gray-500 text-sm mb-3">Ushbu lid nima sababdan yo'qotildi?</p>
                <Input.TextArea
                    rows={3}
                    placeholder="Masalan: Narx qimmat, boshqa markaz tanladi..."
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    autoFocus
                    onPressEnter={(e) => { e.preventDefault(); confirmLost() }}
                />
            </Modal>

            {/* Mobil: holat o'zgartirish drawer */}
            <Drawer
                open={moveDrawer}
                onClose={() => setMoveDrawer(false)}
                placement="bottom"
                height="auto"
                title={`${movingLead?.full_name} — holat o'zgartirish`}
                destroyOnClose
                styles={{ body: { paddingBottom: '24px' } }}
                footer={
                    <Button
                        type="primary"
                        block
                        size="large"
                        loading={changeStatus.isPending}
                        onClick={confirmMove}
                    >
                        O'zgartirish
                    </Button>
                }
            >
                <div className="py-2">
                    <p className="text-sm text-gray-500 mb-3">Yangi holat tanlang:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {LEAD_STATUSES
                            .filter((s) => s !== movingLead?.status)
                            .map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setMoveTarget(s)}
                                    className={`
                                        flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all
                                        ${moveTarget === s
                                            ? 'border-blue-400 bg-blue-50 text-blue-600 ring-2 ring-blue-200/40'
                                            : 'border-gray-200 bg-white text-gray-600'}
                                    `}
                                >
                                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[s]}`} />
                                    {LEAD_STATUS_LABELS[s]}
                                </button>
                            ))}
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default KanbanBoard
