import Menu from '@/components/ui/Menu'
import Dropdown from '@/components/ui/Dropdown'
import VerticalMenuIcon from './VerticalMenuIcon'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import type { CommonProps, TraslationFn } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'
import { useLocation } from 'react-router-dom'

interface DefaultItemProps extends CommonProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    t: TraslationFn
    indent?: boolean
    dotIndent?: boolean
    userAuthority: string[]
}

interface CollapsedItemProps extends DefaultItemProps {
    direction: Direction
    renderAsIcon?: boolean
}

interface VerticalCollapsedMenuItemProps extends CollapsedItemProps {
    sideCollapsed?: boolean
}

const { MenuItem, MenuCollapse } = Menu

const DefaultItem = ({
    nav,
    indent,
    dotIndent,
    children,
    userAuthority,
    t,
}: DefaultItemProps) => {
    const { pathname } = useLocation()

    const hasAuthority = (userAuthority: string[], navAuthority?: string[]) => {
        if (!navAuthority || navAuthority.length === 0) return true
        return navAuthority.some((role) => userAuthority.includes(role))
    }

    const canAccess = hasAuthority(userAuthority, nav.authority)

    const isActive =
        canAccess &&
        (nav.path === pathname ||
            nav.subMenu?.some((child) => child.path === pathname))

    const isDisabled = !canAccess
    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <MenuCollapse
                key={nav.key}
                label={
                    <div className="w-full flex items-center gap-2">
                        <VerticalMenuIcon gutter="" icon={nav.icon} />
                        <span>{t(nav.translateKey, nav.title)}</span>
                    </div>
                }
                active={isActive}
                eventKey={nav.key}
                expanded={false}
                dotIndent={dotIndent}
                indent={indent}
                disabled={isDisabled}
            >
                {children}
            </MenuCollapse>
        </AuthorityCheck>
    )
}

const CollapsedItem = ({
    nav,
    direction,
    children,
    t,
    renderAsIcon,
    userAuthority,
}: CollapsedItemProps) => {
    const { pathname } = useLocation()

    const hasAuthority = (userAuthority: string[], navAuthority?: string[]) => {
        if (!navAuthority || navAuthority.length === 0) return true
        return navAuthority.some((role) => userAuthority.includes(role))
    }

    const canAccess = hasAuthority(userAuthority, nav.authority)

    const isActive =
        canAccess &&
        (nav.path === pathname ||
            nav.subMenu?.some((child) => child.path === pathname))

    const isDisabled = !canAccess

    const menuItem = (
        <MenuItem
            isActive={isActive}
            key={nav.key}
            eventKey={nav.key}
            className="mb-2"
            disabled={isDisabled}
        >
            <VerticalMenuIcon gutter="" icon={nav.icon} />
        </MenuItem>
    )

    const dropdownItem = (
        <div key={nav.key}>{t(nav.translateKey, nav.title)}</div>
    )
    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <Dropdown
                trigger="hover"
                renderTitle={renderAsIcon ? menuItem : dropdownItem}
                placement={direction === 'rtl' ? 'left-start' : 'right-start'}
                disabled={isDisabled}
            >
                {children}
            </Dropdown>
        </AuthorityCheck>
    )
}

const VerticalCollapsedMenuItem = ({
    sideCollapsed,
    ...rest
}: VerticalCollapsedMenuItemProps) => {
    return sideCollapsed ? (
        <CollapsedItem {...rest} />
    ) : (
        <DefaultItem {...rest} />
    )
}

export default VerticalCollapsedMenuItem
