import { lazy } from 'react'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'

const conceptsRoute: Routes = [
    {
        key: 'dashboard.account',
        path: `${DASHBOARDS_PREFIX_PATH}/account`,
        component: lazy(() => import('@/views/dashboards/Account/Account')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
        },
    },
]
export default conceptsRoute
