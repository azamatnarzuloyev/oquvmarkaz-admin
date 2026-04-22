import { useState } from 'react'
import {
    Table, Button, Modal, Form, Input, Select,
    Tag, Switch, Popconfirm, Avatar, message, Tooltip, Badge,
} from 'antd'
import {
    HiPlus, HiPencil, HiTrash, HiKey, HiUserCircle,
    HiShieldCheck, HiPhone,
} from 'react-icons/hi'
import {
    useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff,
    useToggleStaffActive, useResetPassword,
} from './hooks/useOperators'
import type { StaffMember } from './hooks/useOperators'

const ROLE_CONFIG = {
    admin:     { label: 'Admin',      color: 'red',    icon: <HiShieldCheck /> },
    reception: { label: 'Reception',  color: 'blue',   icon: <HiUserCircle /> },
    teacher:   { label: "O'qituvchi", color: 'green',  icon: <HiUserCircle /> },
}

const ROLE_OPTIONS = [
    { value: 'admin',     label: 'Admin' },
    { value: 'reception', label: 'Reception' },
    { value: 'teacher',   label: "O'qituvchi" },
]

const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]

const OperatorsPage = () => {
    const [createModal, setCreateModal]   = useState(false)
    const [editTarget, setEditTarget]     = useState<StaffMember | null>(null)
    const [pwdTarget, setPwdTarget]       = useState<StaffMember | null>(null)
    const [form]    = Form.useForm()
    const [pwdForm] = Form.useForm()

    const { data, isLoading } = useStaff()
    const createStaff  = useCreateStaff()
    const updateStaff  = useUpdateStaff()
    const deleteStaff  = useDeleteStaff()
    const toggleActive = useToggleStaffActive()
    const resetPwd     = useResetPassword()

    const staff = data?.data ?? []

    const openCreate = () => {
        form.resetFields()
        setEditTarget(null)
        setCreateModal(true)
    }

    const openEdit = (member: StaffMember) => {
        setEditTarget(member)
        form.setFieldsValue({
            phone:      member.phone,
            first_name: member.first_name,
            last_name:  member.last_name,
            role:       member.role,
        })
        setCreateModal(true)
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            if (editTarget) {
                await updateStaff.mutateAsync({ id: editTarget.id, ...values })
                message.success('Operator yangilandi')
            } else {
                await createStaff.mutateAsync(values)
                message.success('Operator qo\'shildi')
            }
            setCreateModal(false)
            form.resetFields()
            setEditTarget(null)
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'errorFields' in err) return
            const msg = (err as { response?: { data?: { error?: { message?: string } } } })
                ?.response?.data?.error?.message
            message.error(msg || 'Xato yuz berdi')
        }
    }

    const handleResetPwd = async () => {
        try {
            const values = await pwdForm.validateFields()
            await resetPwd.mutateAsync({ id: pwdTarget!.id, password: values.password })
            message.success('Parol yangilandi')
            setPwdTarget(null)
            pwdForm.resetFields()
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'errorFields' in err) return
            message.error('Xato yuz berdi')
        }
    }

    const columns = [
        {
            title: 'Operator',
            dataIndex: 'full_name',
            render: (_: unknown, row: StaffMember) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        size={36}
                        style={{ backgroundColor: avatarColor(row.id), flexShrink: 0 }}
                    >
                        {getInitials(row.full_name || row.first_name)}
                    </Avatar>
                    <div>
                        <div className="font-medium text-gray-800 text-sm">{row.full_name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <HiPhone className="text-[10px]" />
                            {row.phone}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            width: 120,
            render: (role: keyof typeof ROLE_CONFIG) => {
                const cfg = ROLE_CONFIG[role]
                return <Tag color={cfg.color} icon={cfg.icon} className="text-xs">{cfg.label}</Tag>
            },
        },
        {
            title: 'Lidlar',
            dataIndex: 'leads_count',
            width: 80,
            render: (count: number) => (
                <span className="font-semibold text-blue-600">{count}</span>
            ),
        },
        {
            title: 'Holat',
            dataIndex: 'is_active',
            width: 100,
            render: (active: boolean, row: StaffMember) => (
                <Switch
                    size="small"
                    checked={active}
                    loading={toggleActive.isPending}
                    onChange={() => toggleActive.mutate(row.id)}
                />
            ),
        },
        {
            title: 'Qo\'shilgan',
            dataIndex: 'created_at',
            width: 110,
            render: (v: string) => (
                <span className="text-xs text-gray-400">
                    {new Date(v).toLocaleDateString('uz-UZ')}
                </span>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 100,
            render: (_: unknown, row: StaffMember) => (
                <div className="flex items-center gap-1">
                    <Tooltip title="Tahrirlash">
                        <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            <HiPencil />
                        </button>
                    </Tooltip>
                    <Tooltip title="Parol o'zgartirish">
                        <button
                            onClick={() => { setPwdTarget(row); pwdForm.resetFields() }}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-500 transition-colors"
                        >
                            <HiKey />
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title={`"${row.full_name}" ni o'chirishni tasdiqlang`}
                        onConfirm={() => deleteStaff.mutate(row.id, {
                            onSuccess: () => message.success("O'chirildi"),
                            onError:   () => message.error('Xato yuz berdi'),
                        })}
                        okText="O'chirish"
                        cancelText="Bekor"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="O'chirish">
                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                                <HiTrash />
                            </button>
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        },
    ]

    const activeCount   = staff.filter((s) => s.is_active).length
    const adminCount    = staff.filter((s) => s.role === 'admin').length
    const receptionCount = staff.filter((s) => s.role === 'reception').length
    const teacherCount  = staff.filter((s) => s.role === 'teacher').length

    return (
        <div className="p-6 bg-gray-50/50 min-h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Operatorlar</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Tizim foydalanuvchilarini boshqaring
                    </p>
                </div>
                <Button type="primary" icon={<HiPlus />} onClick={openCreate} className="shadow-sm">
                    Operator qo'shish
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Jami',        value: staff.length,   color: 'text-gray-800' },
                    { label: 'Faol',        value: activeCount,    color: 'text-emerald-600' },
                    { label: 'Admin',       value: adminCount,     color: 'text-red-500' },
                    { label: 'Reception',   value: receptionCount, color: 'text-blue-500' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table
                    dataSource={staff}
                    columns={columns}
                    rowKey="id"
                    loading={isLoading}
                    size="middle"
                    pagination={{ pageSize: 20, showTotal: (t) => `Jami: ${t} ta operator` }}
                    locale={{ emptyText: 'Hech qanday operator yo\'q' }}
                />
            </div>

            {/* Create/Edit Modal */}
            <Modal
                title={editTarget ? 'Operatorni tahrirlash' : 'Yangi operator qo\'shish'}
                open={createModal}
                onOk={handleSubmit}
                onCancel={() => { setCreateModal(false); form.resetFields(); setEditTarget(null) }}
                okText={editTarget ? 'Saqlash' : 'Qo\'shish'}
                cancelText="Bekor"
                confirmLoading={createStaff.isPending || updateStaff.isPending}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                            label="Ism"
                            name="first_name"
                            rules={[{ required: true, message: 'Ism kiriting' }]}
                        >
                            <Input placeholder="Jasur" />
                        </Form.Item>
                        <Form.Item label="Familiya" name="last_name">
                            <Input placeholder="Toshmatov" />
                        </Form.Item>
                    </div>
                    <Form.Item
                        label="Telefon"
                        name="phone"
                        rules={[
                            { required: true, message: 'Telefon kiriting' },
                            { pattern: /^\+998\d{9}$/, message: "+998XXXXXXXXX ko'rinishida" },
                        ]}
                    >
                        <Input placeholder="+998901234567" />
                    </Form.Item>
                    <Form.Item
                        label="Rol"
                        name="role"
                        initialValue="reception"
                        rules={[{ required: true }]}
                    >
                        <Select options={ROLE_OPTIONS} />
                    </Form.Item>
                    <Form.Item
                        label={editTarget ? 'Yangi parol (ixtiyoriy)' : 'Parol'}
                        name="password"
                        rules={editTarget ? [] : [
                            { required: true, message: 'Parol kiriting' },
                            { min: 6, message: 'Kamida 6 belgi' },
                        ]}
                    >
                        <Input.Password placeholder={editTarget ? "O'zgartirmasangiz bo'sh qoldiring" : 'Kamida 6 belgi'} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                title={`Parol o'zgartirish — ${pwdTarget?.full_name}`}
                open={!!pwdTarget}
                onOk={handleResetPwd}
                onCancel={() => { setPwdTarget(null); pwdForm.resetFields() }}
                okText="Saqlash"
                cancelText="Bekor"
                confirmLoading={resetPwd.isPending}
                destroyOnClose
            >
                <Form form={pwdForm} layout="vertical" className="mt-4">
                    <Form.Item
                        label="Yangi parol"
                        name="password"
                        rules={[
                            { required: true, message: 'Parol kiriting' },
                            { min: 6, message: 'Kamida 6 belgi' },
                        ]}
                    >
                        <Input.Password placeholder="Kamida 6 belgi" />
                    </Form.Item>
                    <Form.Item
                        label="Tasdiqlash"
                        name="confirm"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Tasdiqlang' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) return Promise.resolve()
                                    return Promise.reject(new Error('Parollar mos kelmadi'))
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Parolni takrorlang" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default OperatorsPage
