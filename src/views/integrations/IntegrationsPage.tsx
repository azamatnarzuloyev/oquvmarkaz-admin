import { useState } from 'react'
import {
    Button, Modal, Form, Input, Select, Switch, Tooltip,
    message, Tag, Popconfirm, Tabs,
} from 'antd'
import {
    HiPlus, HiClipboardCopy, HiTrash, HiCheckCircle,
    HiCode, HiLink, HiInformationCircle,
} from 'react-icons/hi'
import { FaInstagram, FaTelegram, FaFacebook, FaGlobe } from 'react-icons/fa'
import {
    useWebhookTokens, useCreateToken, useDeleteToken, useToggleToken,
} from './hooks/useIntegrations'
import type { WebhookToken, WebhookPlatform } from './types'
import { PLATFORM_LABELS } from './types'
import InstagramTab from './InstagramTab'

const PLATFORM_OPTIONS = Object.entries(PLATFORM_LABELS).map(([v, l]) => ({ value: v, label: l }))

const PLATFORM_ICON: Record<WebhookPlatform, React.ReactNode> = {
    instagram: <FaInstagram className="text-pink-500" />,
    telegram:  <FaTelegram className="text-sky-500" />,
    facebook:  <FaFacebook className="text-blue-600" />,
    website:   <FaGlobe className="text-emerald-500" />,
    other:     <HiLink className="text-gray-400" />,
}

const PLATFORM_COLOR: Record<WebhookPlatform, string> = {
    instagram: 'pink',
    telegram:  'cyan',
    facebook:  'blue',
    website:   'green',
    other:     'default',
}

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <Tooltip title={copied ? 'Nusxalandi!' : 'Nusxalash'}>
            <button onClick={copy} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors">
                {copied ? <HiCheckCircle className="text-emerald-500" /> : <HiClipboardCopy />}
            </button>
        </Tooltip>
    )
}

const TokenCard = ({ token, onStats }: { token: WebhookToken; onStats: (t: WebhookToken) => void }) => {
    const deleteToken = useDeleteToken()
    const toggleToken = useToggleToken()
    const ctr = token.total_impressions > 0
        ? ((token.total_clicks / token.total_impressions) * 100).toFixed(2)
        : '0'

    return (
        <div className={`bg-white rounded-2xl border ${token.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'} shadow-sm p-5`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
                        {PLATFORM_ICON[token.platform]}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800 text-sm">{token.name}</div>
                        <Tag color={PLATFORM_COLOR[token.platform]} className="text-xs mt-0.5">
                            {PLATFORM_LABELS[token.platform]}
                        </Tag>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        size="small"
                        checked={token.is_active}
                        loading={toggleToken.isPending}
                        onChange={(v) => toggleToken.mutate({ id: token.id, is_active: v })}
                    />
                    <Popconfirm
                        title="O'chirishni tasdiqlang"
                        onConfirm={() => deleteToken.mutate(token.id)}
                        okText="O'chirish" cancelText="Bekor"
                        okButtonProps={{ danger: true }}
                    >
                        <button className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                            <HiTrash />
                        </button>
                    </Popconfirm>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                    { label: 'Ko\'rishlar', value: token.total_impressions.toLocaleString() },
                    { label: 'Clicklar', value: token.total_clicks.toLocaleString() },
                    { label: 'Lidlar', value: token.leads_count },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <div className="text-base font-bold text-gray-800">{value}</div>
                        <div className="text-[11px] text-gray-400">{label}</div>
                    </div>
                ))}
            </div>
            <div className="text-xs text-gray-400 mb-3">CTR: <span className="font-semibold text-gray-600">{ctr}%</span></div>

            {/* Webhook URL */}
            <div className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-2">
                <code className="text-xs text-gray-500 truncate flex-1 font-mono">
                    {token.webhook_url}
                </code>
                <CopyButton text={token.webhook_url} />
            </div>

            <button
                onClick={() => onStats(token)}
                className="mt-2 w-full text-xs text-blue-500 hover:text-blue-600 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
                Batafsil statistika →
            </button>
        </div>
    )
}

const DocsTab = () => {
    const exampleUrl = `https://sizningdomen.uz/api/webhooks/{TOKEN}/`
    const leadPayload = JSON.stringify({ full_name: "Ism Familiya", phone: "+998901234567", notes: "Instagram bio orqali" }, null, 2)
    const statsPayload = JSON.stringify({ date: "2026-04-22", impressions: 1500, clicks: 87 }, null, 2)

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                    <HiInformationCircle className="text-blue-500 text-lg" />
                    <span className="font-semibold text-blue-700">Webhook nima?</span>
                </div>
                <p className="text-sm text-blue-600 leading-relaxed">
                    Webhook — bu reklama platformangiz (Instagram, Telegram bot, landing page) dan
                    avtomatik ravishda lidlarni tizimga yuborish uchun maxsus URL.
                    Har bir manba uchun alohida token yarating va u orqali kelgan lidlarni kuzating.
                </p>
            </div>

            {/* Lead webhook */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">POST</span>
                    <code className="text-sm text-gray-700 font-mono">/api/webhooks/{'{TOKEN}'}/</code>
                    <span className="text-xs text-gray-400 ml-1">— Yangi lead yuborish</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                    Autentifikatsiya talab qilinmaydi. Token URL da o'tkaziladi.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5">Request body</div>
                        <pre className="bg-gray-900 text-emerald-400 rounded-xl p-3 text-xs overflow-x-auto font-mono leading-relaxed">
                            {leadPayload}
                        </pre>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5">Response (201)</div>
                        <pre className="bg-gray-900 text-sky-400 rounded-xl p-3 text-xs font-mono leading-relaxed">
{`{
  "success": true,
  "data": {
    "lead_id": 42
  }
}`}
                        </pre>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-500 mb-1.5">Maydonlar</div>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-1.5 text-gray-500 font-medium">Maydon</th>
                                <th className="text-left py-1.5 text-gray-500 font-medium">Tur</th>
                                <th className="text-left py-1.5 text-gray-500 font-medium">Tavsif</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {[
                                ['full_name', 'string', 'Mijoz ismi — majburiy'],
                                ['phone', 'string', 'Telefon raqam — majburiy'],
                                ['notes', 'string', 'Qo\'shimcha izoh — ixtiyoriy'],
                            ].map(([f, t, d]) => (
                                <tr key={f} className="border-b border-gray-50">
                                    <td className="py-1.5 font-mono text-violet-600">{f}</td>
                                    <td className="py-1.5 text-gray-400">{t}</td>
                                    <td className="py-1.5">{d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats webhook */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">POST</span>
                    <code className="text-sm text-gray-700 font-mono">/api/webhooks/{'{TOKEN}'}/stats/</code>
                    <span className="text-xs text-gray-400 ml-1">— Kunlik statistika yuborish</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                    Har kuni reklama platformangizdan impressions va clicks ma'lumotini yuboring.
                    Bir xil sana uchun qayta yuborilsa, qiymatlar <strong>qo'shiladi</strong>.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5">Request body</div>
                        <pre className="bg-gray-900 text-emerald-400 rounded-xl p-3 text-xs overflow-x-auto font-mono leading-relaxed">
                            {statsPayload}
                        </pre>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5">cURL misol</div>
                        <pre className="bg-gray-900 text-amber-300 rounded-xl p-3 text-xs font-mono leading-relaxed overflow-x-auto">
{`curl -X POST \\
  "${exampleUrl}stats/" \\
  -H "Content-Type: application/json" \\
  -d '${statsPayload}'`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Platform-specific tips */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <HiCode className="text-gray-500" />
                    <span className="font-semibold text-gray-700 text-sm">Platform integratsiyalari</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                        <FaInstagram className="text-pink-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-xs font-semibold text-pink-700 mb-1">Instagram / Facebook Lead Ads</div>
                            <p className="text-xs text-pink-600">
                                Meta Business Manager → Lead Ads → CRM Integration → Custom Webhook URL.
                                Webhook URL ni "Leads Access" bo'limiga qo'shing.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                        <FaTelegram className="text-sky-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-xs font-semibold text-sky-700 mb-1">Telegram bot</div>
                            <p className="text-xs text-sky-600">
                                Bot kod bazasida foydalanuvchi telefon raqamini olgandan so'ng
                                ushbu webhook URL ga POST so'rov yuboring.
                            </p>
                            <pre className="mt-2 bg-sky-100 rounded-lg p-2 text-xs font-mono text-sky-800 overflow-x-auto">
{`import requests
requests.post("${exampleUrl}", json={
    "full_name": user.full_name,
    "phone": user.phone,
    "notes": "Telegram bot orqali"
})`}
                            </pre>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <FaGlobe className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-xs font-semibold text-emerald-700 mb-1">Landing page / Sayt formi</div>
                            <p className="text-xs text-emerald-600">
                                Form submit eventida JavaScript orqali webhook ga so'rov yuboring.
                            </p>
                            <pre className="mt-2 bg-emerald-100 rounded-lg p-2 text-xs font-mono text-emerald-800 overflow-x-auto">
{`fetch("${exampleUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    full_name: form.name.value,
    phone: form.phone.value
  })
})`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const IntegrationsPage = () => {
    const [createModal, setCreateModal] = useState(false)
    const [form] = Form.useForm()
    const { data, isLoading } = useWebhookTokens()
    const createToken = useCreateToken()

    const tokens = data?.results ?? []

    const handleCreate = async () => {
        try {
            const values = await form.validateFields()
            await createToken.mutateAsync(values)
            form.resetFields()
            setCreateModal(false)
            message.success('Webhook token yaratildi')
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'errorFields' in err) return
            message.error('Xato yuz berdi')
        }
    }

    return (
        <div className="p-6 bg-gray-50/50 min-h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Integratsiyalar</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Reklama manbalari uchun webhook URL larni boshqaring
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<HiPlus />}
                    onClick={() => setCreateModal(true)}
                    className="shadow-sm"
                >
                    Yangi webhook
                </Button>
            </div>

            <Tabs
                defaultActiveKey="tokens"
                items={[
                    {
                        key: 'tokens',
                        label: 'Webhook tokenlar',
                        children: (
                            <div>
                                {isLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse" />
                                        ))}
                                    </div>
                                ) : tokens.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                                        <div className="text-4xl mb-3">🔗</div>
                                        <div className="text-gray-400 text-sm">Hech qanday webhook yo'q</div>
                                        <div className="text-gray-300 text-xs mt-1">Yangi webhook yarating</div>
                                        <Button
                                            type="primary"
                                            icon={<HiPlus />}
                                            className="mt-4"
                                            onClick={() => setCreateModal(true)}
                                        >
                                            Yaratish
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tokens.map((t) => (
                                            <TokenCard
                                                key={t.id}
                                                token={t}
                                                onStats={() => {}}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: 'instagram',
                        label: (
                            <span className="flex items-center gap-1.5">
                                <FaInstagram className="text-pink-500" />
                                Instagram
                            </span>
                        ),
                        children: <InstagramTab />,
                    },
                    {
                        key: 'docs',
                        label: (
                            <span className="flex items-center gap-1.5">
                                <HiCode />
                                Texnik hujjat
                            </span>
                        ),
                        children: <DocsTab />,
                    },
                ]}
            />

            <Modal
                title="Yangi webhook token"
                open={createModal}
                onOk={handleCreate}
                onCancel={() => { setCreateModal(false); form.resetFields() }}
                okText="Yaratish"
                cancelText="Bekor"
                confirmLoading={createToken.isPending}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        label="Nom"
                        name="name"
                        rules={[{ required: true, message: 'Nom kiriting' }]}
                    >
                        <Input placeholder="Masalan: Instagram Stories reklama" />
                    </Form.Item>
                    <Form.Item
                        label="Platform"
                        name="platform"
                        initialValue="instagram"
                        rules={[{ required: true }]}
                    >
                        <Select options={PLATFORM_OPTIONS} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default IntegrationsPage
