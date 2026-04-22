import { useState } from 'react'
import { Drawer, Tag, Button, Input, Select, Divider, Spin, message, Tooltip, Modal } from 'antd'
import { HiPencil, HiPhone, HiAnnotation, HiClock, HiExclamationCircle, HiChevronRight } from 'react-icons/hi'
import { FaInstagram, FaTelegram, FaGlobe, FaUsers } from 'react-icons/fa'
import { HiQuestionMarkCircle } from 'react-icons/hi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/uz'
import type { Lead, LeadSource, LeadStatus, ActivityType } from '../types'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS, LEAD_STATUSES } from '../types'
import { useLead, useAddActivity, useConvertLead, useChangeLeadStatus } from '../hooks/useLeads'
import { getApiError } from '@/service/get.service'
import useResponsive from '@/utils/hooks/useResponsive'

dayjs.extend(relativeTime)
dayjs.locale('uz')

const SOURCE_ICON: Record<LeadSource, React.ReactNode> = {
    instagram: <FaInstagram className="text-pink-500" />,
    telegram:  <FaTelegram className="text-sky-500" />,
    referral:  <FaUsers className="text-violet-500" />,
    website:   <FaGlobe className="text-emerald-500" />,
    other:     <HiQuestionMarkCircle className="text-gray-400" />,
}

const ACTIVITY_ICON: Record<ActivityType, React.ReactNode> = {
    call:           <HiPhone className="text-blue-500" />,
    note:           <HiAnnotation className="text-amber-500" />,
    status_changed: <HiClock className="text-violet-500" />,
    sms_sent:       <HiExclamationCircle className="text-emerald-500" />,
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
    call:           "Qo'ng'iroq",
    note:           'Eslatma',
    status_changed: "Holat o'zgartirildi",
    sms_sent:       'SMS yuborildi',
}

const ACTIVITY_OPTIONS = [
    { value: 'call', label: "Qo'ng'iroq" },
    { value: 'note', label: 'Eslatma' },
]

interface LeadDetailProps {
    lead: Lead | null
    open: boolean
    onClose: () => void
    onEdit: (lead: Lead) => void
}

const LeadDetail = ({ lead, open, onClose, onEdit }: LeadDetailProps) => {
    const [actType, setActType]         = useState<ActivityType>('call')
    const [actContent, setActContent]   = useState('')
    const [lostModal, setLostModal]     = useState(false)
    const [lostReason, setLostReason]   = useState('')
    const { smaller } = useResponsive()
    const isMobile = smaller.md

    const { data, isLoading } = useLead(lead?.id ?? 0)
    const detail = data?.data ?? lead

    const addActivity    = useAddActivity()
    const convertLead    = useConvertLead()
    const changeStatus   = useChangeLeadStatus()

    const handleStatusChange = (newStatus: LeadStatus) => {
        if (!detail) return
        if (newStatus === detail.status) return
        if (newStatus === 'lost') {
            setLostModal(true)
            return
        }
        changeStatus.mutate(
            { id: detail.id, status: newStatus },
            { onSuccess: () => message.success("Holat o'zgartirildi") },
        )
    }

    const handleLostConfirm = () => {
        if (!detail) return
        changeStatus.mutate(
            { id: detail.id, status: 'lost', lost_reason: lostReason },
            {
                onSuccess: () => {
                    message.success("Holat o'zgartirildi")
                    setLostModal(false)
                    setLostReason('')
                },
            },
        )
    }

    const handleAddActivity = async () => {
        if (!actContent.trim() || !detail) return
        try {
            await addActivity.mutateAsync({ id: detail.id, type: actType, content: actContent.trim() })
            setActContent('')
            message.success("Faoliyat qo'shildi")
        } catch (err) {
            message.error(getApiError(err))
        }
    }

    const handleConvert = async () => {
        if (!detail) return
        try {
            await convertLead.mutateAsync(detail.id)
            message.success('Lid talabaga aylandi!')
            onClose()
        } catch (err) {
            message.error(getApiError(err))
        }
    }

    if (!detail) return null

    const initials = detail.full_name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const activities = data?.data?.activities ?? []

    return (
        <Drawer
            open={open}
            onClose={onClose}
            placement={isMobile ? 'bottom' : 'right'}
            height={isMobile ? '92dvh' : undefined}
            width={isMobile ? '100%' : 520}
            destroyOnClose
            title={null}
            styles={{ body: { padding: 0 }, header: { display: 'none' } }}
            closeIcon={null}
        >
            {/* Drag handle — mobilda */}
            {isMobile && (
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>
            )}

            {/* Gradient header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 pt-4 pb-7">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-base leading-tight">{detail.full_name}</h2>
                            <a
                                href={`tel:${detail.phone}`}
                                className="text-blue-100 text-sm hover:text-white transition-colors flex items-center gap-1"
                            >
                                <HiPhone size={12} />
                                {detail.phone}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="small"
                            icon={<HiPencil />}
                            onClick={() => { onEdit(detail); onClose() }}
                            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        >
                            {!isMobile && 'Tahrirlash'}
                        </Button>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Tag color={LEAD_STATUS_COLORS[detail.status]} className="border-0 text-xs">
                        {LEAD_STATUS_LABELS[detail.status]}
                    </Tag>
                    <div className="flex items-center gap-1 text-blue-100 text-xs">
                        {SOURCE_ICON[detail.source]}
                        <span>{LEAD_SOURCE_LABELS[detail.source]}</span>
                    </div>
                    {detail.assigned_to_name && (
                        <span className="text-blue-100 text-xs">• {detail.assigned_to_name}</span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 -mt-3 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(92dvh - 160px)' : 'calc(100dvh - 140px)' }}>

                {/* Status stepper */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4">
                    <div className="text-xs text-gray-400 mb-2 font-medium">Holat o'zgartirish</div>
                    <div className="flex items-center gap-1 flex-wrap">
                        {LEAD_STATUSES.map((s, i) => {
                            const isActive  = detail.status === s
                            const colorMap: Record<LeadStatus, string> = {
                                new:       'bg-blue-500',
                                no_answer: 'bg-gray-400',
                                thinking:  'bg-orange-400',
                                trial:     'bg-purple-500',
                                converted: 'bg-emerald-500',
                                lost:      'bg-red-400',
                            }
                            const activeBg = colorMap[s]
                            return (
                                <div key={s} className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleStatusChange(s)}
                                        disabled={changeStatus.isPending}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                            isActive
                                                ? `${activeBg} text-white shadow-sm`
                                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                        }`}
                                    >
                                        {LEAD_STATUS_LABELS[s]}
                                    </button>
                                    {i < LEAD_STATUSES.length - 1 && (
                                        <HiChevronRight className="text-gray-200 flex-shrink-0" size={12} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {detail.trial_date && (
                        <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                            <div className="text-xs text-violet-400 mb-0.5">Sinov dars</div>
                            <div className="text-sm font-semibold text-violet-700">
                                {dayjs(detail.trial_date).format('DD MMM YYYY')}
                            </div>
                        </div>
                    )}
                    {detail.lost_reason && (
                        <div className="bg-red-50 rounded-xl p-3 border border-red-100 col-span-2">
                            <div className="text-xs text-red-400 mb-0.5">Yo'qotish sababi</div>
                            <div className="text-sm text-red-600">{detail.lost_reason}</div>
                        </div>
                    )}
                    {detail.notes && (
                        <div className="col-span-2 bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <div className="text-xs text-amber-400 mb-0.5">Izoh</div>
                            <div className="text-sm text-amber-700">{detail.notes}</div>
                        </div>
                    )}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-xs text-gray-400 mb-0.5">Qo'shilgan</div>
                        <div className="text-sm font-medium text-gray-600">
                            {dayjs(detail.created_at).format('DD.MM.YYYY')}
                        </div>
                    </div>
                    {detail.converted_at && (
                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <div className="text-xs text-emerald-400 mb-0.5">To'lov qilgan</div>
                            <div className="text-sm font-semibold text-emerald-700">
                                {dayjs(detail.converted_at).format('DD.MM.YYYY')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Convert button */}
                {detail.status !== 'converted' && detail.status !== 'lost' && (
                    <Button
                        type="primary"
                        block
                        size={isMobile ? 'large' : 'middle'}
                        className="mb-4 bg-emerald-500 hover:bg-emerald-600 border-emerald-500 shadow-sm"
                        loading={convertLead.isPending}
                        onClick={handleConvert}
                    >
                        Talabaga aylantirish ✓
                    </Button>
                )}

                <Divider className="my-3">
                    <span className="text-xs text-gray-400 font-medium">Faoliyat tarixi</span>
                </Divider>

                {/* Add activity */}
                <div className={`flex gap-2 mb-4 ${isMobile ? 'flex-col' : ''}`}>
                    <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
                        <Select
                            value={actType}
                            onChange={setActType}
                            options={ACTIVITY_OPTIONS}
                            className={isMobile ? 'flex-1' : 'w-36'}
                            size={isMobile ? 'large' : 'small'}
                        />
                        <Input
                            size={isMobile ? 'large' : 'small'}
                            placeholder="Matn kiriting..."
                            value={actContent}
                            onChange={(e) => setActContent(e.target.value)}
                            onPressEnter={handleAddActivity}
                            className="flex-1"
                        />
                    </div>
                    <Button
                        size={isMobile ? 'large' : 'small'}
                        type="primary"
                        block={isMobile}
                        loading={addActivity.isPending}
                        onClick={handleAddActivity}
                        disabled={!actContent.trim()}
                    >
                        Qo'shish
                    </Button>
                </div>

                {/* Timeline */}
                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <Spin size="small" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-300 text-sm">
                        Hech qanday faoliyat yo'q
                    </div>
                ) : (
                    <div className="space-y-2">
                        {activities.map((act) => (
                            <div key={act.id} className="flex gap-3 items-start">
                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {ACTIVITY_ICON[act.type as ActivityType]}
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-gray-600">
                                            {ACTIVITY_LABELS[act.type as ActivityType]}
                                        </span>
                                        <Tooltip title={dayjs(act.created_at).format('DD.MM.YYYY HH:mm')}>
                                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                                {dayjs(act.created_at).fromNow()}
                                            </span>
                                        </Tooltip>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{act.content}</p>
                                    {act.created_by_name && (
                                        <span className="text-[11px] text-gray-300">{act.created_by_name}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Drawer>

        {/* Lost reason modal */}
        <Modal
            title="Yo'qotish sababi"
            open={lostModal}
            onOk={handleLostConfirm}
            onCancel={() => { setLostModal(false); setLostReason('') }}
            okText="Saqlash"
            cancelText="Bekor"
            confirmLoading={changeStatus.isPending}
            okButtonProps={{ danger: true }}
            destroyOnClose
        >
            <Input.TextArea
                className="mt-3"
                rows={3}
                placeholder="Nima sababdan rad etdi? (ixtiyoriy)"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
            />
        </Modal>
    )
}

export default LeadDetail
