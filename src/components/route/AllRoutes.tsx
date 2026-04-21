// import ProtectedRoute from './ProtectedRoute'
// import PublicRoute from './PublicRoute'
// import AuthorityGuard from './AuthorityGuard'
// import AppRoute from './AppRoute'
// import PageContainer from '@/components/template/PageContainer'
// import { protectedRoutes, publicRoutes } from '@/configs/routes.config'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import type { LayoutType } from '@/@types/theme'
// import { useAuth } from '@/auth'

// interface ViewsProps {
//     pageContainerType?: 'default' | 'gutterless' | 'contained'
//     layout?: LayoutType
// }

// type AllRoutesProps = ViewsProps

// const AllRoutes = (props: AllRoutesProps) => {
//     const { user } = useAuth()
//     const authenticatedEntryPath = `/dashboards/${user?.authority?.[0] === "admin" ? 'control' : user?.authority?.[0] === 'shop' ? 'warehouse' : user?.authority?.[0] || ''}`

//     const renderRoutes = (routes: typeof protectedRoutes) => {
//         return routes.map((route) => (
//             <Route
//                 key={route.key}
//                 path={route.path}
//                 element={
//                     <AuthorityGuard authority={route.authority}>
//                         <PageContainer {...props} {...route.meta}>
//                             <AppRoute
//                                 routeKey={route.key}
//                                 component={route.component}
//                                 {...route.meta}
//                             />
//                         </PageContainer>
//                     </AuthorityGuard>
//                 }
//             >
//                 {route.children && renderRoutes(route.children)}
//             </Route>
//         ))
//     }

//     return (
//         <Routes>
//             <Route path="/" element={<ProtectedRoute />}>
//                 <Route
//                     path="/"
//                     element={<Navigate replace to={authenticatedEntryPath} />}
//                 />
//                 {renderRoutes(protectedRoutes)}
//                 <Route path="*" element={<Navigate replace to="/" />} />
//             </Route>

//             <Route path="/" element={<PublicRoute />}>
//                 {publicRoutes.map((route) => (
//                     <Route
//                         key={route.path}
//                         path={route.path}
//                         element={
//                             <AppRoute
//                                 routeKey={route.key}
//                                 component={route.component}
//                                 {...route.meta}
//                             />
//                         }
//                     />
//                 ))}
//             </Route>
//         </Routes>
//     )
// }

// export default AllRoutes


import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import AuthorityGuard from './AuthorityGuard'
import AppRoute from './AppRoute'
import PageContainer from '@/components/template/PageContainer'
import { protectedRoutes, publicRoutes } from '@/configs/routes.config'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { LayoutType } from '@/@types/theme'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

type AllRoutesProps = ViewsProps

const { authenticatedEntryPath } = appConfig

const AllRoutes = (props: AllRoutesProps) => {
    const { user } = useAuth()

    return (
        <Routes>
            <Route path="/" element={<ProtectedRoute />}>
                <Route
                    path="/"
                    element={<Navigate replace to={authenticatedEntryPath} />}
                />
                {protectedRoutes.map((route, index) => (
                    <Route
                        key={route.key + index}
                        path={route.path}
                        element={
                            <AuthorityGuard
                                userAuthority={user.authority}
                                authority={route.authority}
                            >
                                <PageContainer {...props} {...route.meta}>
                                    <AppRoute
                                        routeKey={route.key}
                                        component={route.component}
                                        {...route.meta}
                                    />
                                </PageContainer>
                            </AuthorityGuard>
                        }
                    />
                ))}
                <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
            <Route path="/" element={<PublicRoute />}>
                {publicRoutes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            <AppRoute
                                routeKey={route.key}
                                component={route.component}
                                {...route.meta}
                            />
                        }
                    />
                ))}
            </Route>
        </Routes>
    )
}

export default AllRoutes
