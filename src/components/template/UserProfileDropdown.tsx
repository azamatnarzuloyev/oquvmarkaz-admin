import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { TbUser, TbLogout, TbSettings } from 'react-icons/tb'
import { useAuth } from '@/auth'

const ROLE_LABELS: Record<string, string> = {
    admin:     'Admin',
    reception: 'Reception',
    teacher:   "O'qituvchi",
    student:   'Talaba',
}

const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || 'U'

const _UserDropdown = () => {
    const { userName, authority } = useSessionUser((s) => s.user)
    const { signOut } = useAuth()

    const role     = authority?.[0] ?? ''
    const initials = getInitials(userName ?? '')

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl px-2 py-1.5 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm select-none">
                        {initials}
                    </div>
                    <div className="hidden md:flex flex-col leading-none">
                        <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                            {userName || 'Foydalanuvchi'}
                        </span>
                        <span className="text-[11px] text-gray-400 capitalize">
                            {ROLE_LABELS[role] ?? role}
                        </span>
                    </div>
                </div>
            }
            placement="bottom-end"
        >
            {/* Dropdown header */}
            <Dropdown.Item variant="header">
                <div className="px-3 py-2.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm select-none">
                        {initials}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {userName || 'Foydalanuvchi'}
                        </p>
                        <span className="text-xs text-indigo-500 font-medium capitalize">
                            {ROLE_LABELS[role] ?? role}
                        </span>
                    </div>
                </div>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item eventKey="profil" className="px-0">
                <Link className="flex h-full w-full px-3 py-1" to="/dashboards/account">
                    <span className="flex gap-2.5 items-center w-full text-gray-600 dark:text-gray-300">
                        <TbUser size={16} />
                        <span className="text-sm">Profil sozlamalari</span>
                    </span>
                </Link>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item
                eventKey="chiqish"
                className="px-3 py-1 gap-2.5 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={signOut}
            >
                <TbLogout size={16} />
                <span className="text-sm font-medium">Chiqish</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
