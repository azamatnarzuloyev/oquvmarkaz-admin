import { lazy } from 'react'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'
import { ADMIN, RECEPTION } from '@/constants/roles.constant'

const dashboardsRoute: Routes = [
    {
        key: 'dashboard.control',
        path: `${DASHBOARDS_PREFIX_PATH}/control`,
        component: lazy(
            () => import('@/views/dashboards/Control/ControlDashboard'),
        ),
        authority: [ADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'crm.leads',
        path: '/leads',
        component: lazy(() => import('@/views/leads/LeadsPage')),
        authority: [ADMIN, RECEPTION],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'crm.dashboard',
        path: '/crm/dashboard',
        component: lazy(() => import('@/views/dashboards/LeadsDashboard')),
        authority: [ADMIN, RECEPTION],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'integrations.webhooks',
        path: '/integrations',
        component: lazy(() => import('@/views/integrations/IntegrationsPage')),
        authority: [ADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'integrations.targeting',
        path: '/integrations/targeting',
        component: lazy(() => import('@/views/integrations/TargetingDashboard')),
        authority: [ADMIN, RECEPTION],
        meta: { pageContainerType: 'contained' },
    },
]

export default dashboardsRoute
