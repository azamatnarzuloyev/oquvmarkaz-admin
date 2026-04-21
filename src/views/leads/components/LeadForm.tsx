import { useEffect } from 'react'
import { Drawer, Form, Input, Select, DatePicker, Button, message } from 'antd'
import dayjs from 'dayjs'
import type { Lead, LeadCreatePayload, LeadUpdatePayload } from '../types'
import { LEAD_SOURCE_LABELS } from '../types'
import { useCreateLead, useUpdateLead } from '../hooks/useLeads'
import { getApiError } from '@/service/get.service'
import useResponsive from '@/utils/hooks/useResponsive'

const { TextArea } = Input

const SOURCE_OPTIONS = Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => ({
    value,
    label,
}))

const PHONE_REGEX = /^\+998\d{9}$/

interface LeadFormProps {
    open: boolean
    lead?: Lead | null
    onClose: () => void
}

const LeadForm = ({ open, lead, onClose }: LeadFormProps) => {
    const [form] = Form.useForm()
    const isEdit = !!lead
    const { smaller } = useResponsive()
    const isMobile = smaller.md

    const createLead = useCreateLead()
    const updateLead = useUpdateLead(lead?.id ?? 0)

    useEffect(() => {
        if (open && lead) {
            form.setFieldsValue({
                full_name:  lead.full_name,
                phone:      lead.phone,
                source:     lead.source,
                notes:      lead.notes,
                trial_date: lead.trial_date ? dayjs(lead.trial_date) : null,
            })
        } else if (open) {
            form.resetFields()
        }
    }, [open, lead, form])

    const onFinish = async (values: any) => {
        const payload: LeadCreatePayload | LeadUpdatePayload = {
            full_name:  values.full_name.trim(),
            phone:      values.phone.trim(),
            source:     values.source,
            notes:      values.notes ?? '',
            trial_date: values.trial_date
                ? dayjs(values.trial_date).format('YYYY-MM-DD')
                : null,
        }

        try {
            if (isEdit) {
                await updateLead.mutateAsync(payload as LeadUpdatePayload)
                message.success('Lid yangilandi')
            } else {
                await createLead.mutateAsync(payload as LeadCreatePayload)
                message.success("Lid qo'shildi")
            }
            onClose()
        } catch (err) {
            message.error(getApiError(err))
        }
    }

    const isPending = createLead.isPending || updateLead.isPending

    return (
        <Drawer
            title={isEdit ? 'Lidni tahrirlash' : "Yangi lid qo'shish"}
            open={open}
            onClose={onClose}
            placement={isMobile ? 'bottom' : 'right'}
            height={isMobile ? '90dvh' : undefined}
            width={isMobile ? '100%' : 480}
            destroyOnClose
            styles={{
                body: { paddingBottom: isMobile ? '24px' : undefined },
            }}
            footer={
                <div className="flex gap-2 justify-end">
                    <Button onClick={onClose} disabled={isPending}>
                        Bekor qilish
                    </Button>
                    <Button
                        type="primary"
                        loading={isPending}
                        onClick={() => form.submit()}
                    >
                        {isEdit ? 'Saqlash' : "Qo'shish"}
                    </Button>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <div className={isMobile ? 'grid grid-cols-1 gap-0' : ''}>
                    <Form.Item
                        label="Ism familiya"
                        name="full_name"
                        rules={[{ required: true, message: 'Ism majburiy' }]}
                    >
                        <Input placeholder="Alisher Valiyev" size={isMobile ? 'large' : 'middle'} />
                    </Form.Item>

                    <Form.Item
                        label="Telefon"
                        name="phone"
                        rules={[
                            { required: true, message: 'Telefon majburiy' },
                            { pattern: PHONE_REGEX, message: 'Format: +998XXXXXXXXX' },
                        ]}
                    >
                        <Input
                            placeholder="+998901234567"
                            size={isMobile ? 'large' : 'middle'}
                            type="tel"
                            inputMode="tel"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Manba"
                        name="source"
                        rules={[{ required: true, message: 'Manba majburiy' }]}
                    >
                        <Select
                            placeholder="Tanlang"
                            options={SOURCE_OPTIONS}
                            size={isMobile ? 'large' : 'middle'}
                        />
                    </Form.Item>

                    <Form.Item label="Sinov dars sanasi" name="trial_date">
                        <DatePicker
                            className="w-full"
                            format="DD.MM.YYYY"
                            placeholder="Tanlang"
                            size={isMobile ? 'large' : 'middle'}
                        />
                    </Form.Item>

                    <Form.Item label="Izoh" name="notes">
                        <TextArea
                            rows={3}
                            placeholder="Qo'shimcha ma'lumot..."
                        />
                    </Form.Item>
                </div>
            </Form>
        </Drawer>
    )
}

export default LeadForm
