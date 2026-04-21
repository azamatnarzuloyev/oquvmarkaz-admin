// import { Navigate, Outlet } from 'react-router-dom'
// import { useAuth } from '@/auth'

// const PublicRoute = () => {
//     const { authenticated, user } = useAuth()

//     const authenticatedEntryPath = `/dashboards/${user?.authority?.[0] === 'admin' ? 'control' : user?.authority?.[0] === 'shop' ? 'warehouse' : user?.authority?.[0] || ''}`

//     return authenticated ? <Navigate to={authenticatedEntryPath} /> : <Outlet />
// }

// export default PublicRoute


import { Navigate, Outlet } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'

const { authenticatedEntryPath } = appConfig

const PublicRoute = () => {
    const { authenticated } = useAuth()

    return authenticated ? <Navigate to={authenticatedEntryPath} /> : <Outlet />
}

export default PublicRoute
