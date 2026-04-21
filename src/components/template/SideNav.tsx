import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import Logo from '@/components/template/Logo'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import { useThemeStore } from '@/store/themeStore'
import { useSessionUser } from '@/store/authStore'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import navigationConfig from '@/configs/navigation.config'
import appConfig from '@/configs/app.config'
import { Link } from 'react-router-dom'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    SIDE_NAV_CONTENT_GUTTER,
    HEADER_HEIGHT,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    admin:     { label: 'Admin',     color: 'bg-violet-100 text-violet-700' },
    reception: { label: 'Reception', color: 'bg-blue-100 text-blue-700'    },
    teacher:   { label: "O'qituvchi",color: 'bg-emerald-100 text-emerald-700' },
    student:   { label: 'Talaba',    color: 'bg-amber-100 text-amber-700'  },
}

const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || 'U'

type SideNavProps = {
    translationSetup?: boolean
    background?: boolean
    className?: string
    contentClass?: string
    mode?: Mode
}

const sideNavStyle      = { width: SIDE_NAV_WIDTH,          minWidth: SIDE_NAV_WIDTH          }
const sideNavCollapseStyle = { width: SIDE_NAV_COLLAPSED_WIDTH, minWidth: SIDE_NAV_COLLAPSED_WIDTH }

const SideNav = ({
    translationSetup = true,
    background = true,
    className,
    contentClass,
    mode,
}: SideNavProps) => {
    const defaultMode      = useThemeStore((s) => s.mode)
    const direction        = useThemeStore((s) => s.direction)
    const sideNavCollapse  = useThemeStore((s) => s.layout.sideNavCollapse)
    const currentRouteKey  = useRouteKeyStore((s) => s.currentRouteKey)
    const { userName, authority } = useSessionUser((s) => s.user)

    const role     = authority?.[0] ?? ''
    const roleInfo = ROLE_LABELS[role] ?? { label: role, color: 'bg-gray-100 text-gray-600' }
    const initials = getInitials(userName ?? '')

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            {/* Logo */}
            <Link
                to={appConfig.authenticatedEntryPath}
                className="side-nav-header flex flex-col justify-center"
                style={{ height: HEADER_HEIGHT }}
            >
                <Logo
                    imgClass=""
                    mode={mode || defaultMode}
                    type={sideNavCollapse ? 'streamline' : 'full'}
                    className={classNames(
                        sideNavCollapse && 'ltr:ml-[11.5px] ltr:mr-[11.5px]',
                        sideNavCollapse ? SIDE_NAV_CONTENT_GUTTER : LOGO_X_GUTTER,
                    )}
                />
            </Link>

            {/* Menu */}
            <div className={classNames('side-nav-content', contentClass)}>
                <ScrollBar style={{ height: '100%' }} direction={direction}>
                    <VerticalMenuContent
                        collapsed={sideNavCollapse}
                        navigationTree={navigationConfig}
                        routeKey={currentRouteKey}
                        direction={direction}
                        translationSetup={translationSetup}
                        userAuthority={authority || []}
                    />
                </ScrollBar>
            </div>

            {/* User card — pastda */}
            <div className={classNames(
                'border-t border-gray-100 dark:border-gray-700',
                sideNavCollapse ? 'p-2' : 'p-3',
            )}>
                {sideNavCollapse ? (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {initials}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate leading-tight">
                                {userName || 'Foydalanuvchi'}
                            </p>
                            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5 ${roleInfo.color}`}>
                                {roleInfo.label}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SideNav
