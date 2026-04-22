import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, RECEPTION } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const dashboardsNavigationConfig: NavigationTree[] = [
    {
        key: 'dashboard',
        path: '',
        title: 'Asosiy',
        translateKey: 'dashboard.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, RECEPTION],
        meta: { horizontalMenu: { layout: 'default' } },
        subMenu: [
            {
                key: 'dashboard.control',
                path: `${DASHBOARDS_PREFIX_PATH}/control`,
                title: 'Boshqaruv paneli',
                translateKey: 'dashboard.control',
                icon: 'control',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                subMenu: [],
            },
        ],
    },
    {
        key: 'crm',
        path: '',
        title: 'Savdo',
        translateKey: 'crm.title',
        icon: 'crm',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, RECEPTION],
        meta: { horizontalMenu: { layout: 'default' } },
        subMenu: [
            {
                key: 'crm.dashboard',
                path: '/crm/dashboard',
                title: 'Analitika',
                translateKey: 'crm.dashboard',
                icon: 'dashboard',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, RECEPTION],
                subMenu: [],
            },
            {
                key: 'crm.leads',
                path: '/leads',
                title: 'Lidlar',
                translateKey: 'crm.leads',
                icon: 'leads',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, RECEPTION],
                subMenu: [],
            },
        ],
    },
    {
        key: 'integrations',
        path: '',
        title: 'Marketing',
        translateKey: 'integrations.title',
        icon: 'integrations',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, RECEPTION],
        meta: { horizontalMenu: { layout: 'default' } },
        subMenu: [
            {
                key: 'integrations.targeting',
                path: '/integrations/targeting',
                title: 'Targeting paneli',
                translateKey: 'integrations.targeting',
                icon: 'targeting',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, RECEPTION],
                subMenu: [],
            },
            {
                key: 'integrations.webhooks',
                path: '/integrations',
                title: 'Webhook tokenlar',
                translateKey: 'integrations.webhooks',
                icon: 'integrations',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                subMenu: [],
            },
        ],
    },
    {
        key: 'settings',
        path: '',
        title: 'Sozlamalar',
        translateKey: 'settings.title',
        icon: 'settings',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN],
        meta: { horizontalMenu: { layout: 'default' } },
        subMenu: [
            {
                key: 'settings.operators',
                path: '/operators',
                title: 'Operatorlar',
                translateKey: 'settings.operators',
                icon: 'operators',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                subMenu: [],
            },
        ],
    },
]

export default dashboardsNavigationConfig
