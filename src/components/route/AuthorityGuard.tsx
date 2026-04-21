// import { PropsWithChildren, useEffect } from 'react'
// import { Navigate, useLocation, useNavigate } from 'react-router-dom'
// import useAuthority from '@/utils/hooks/useAuthority'
// import { useAuth } from '@/auth'

// type AuthorityGuardProps = PropsWithChildren<{
//     userAuthority?: string[]
//     authority?: string[]
// }>

// const AuthorityGuard = (props: AuthorityGuardProps) => {
//     const { userAuthority = [], authority = [], children } = props
//     const { user } = useAuth()
//     const router = useNavigate()
//     const { pathname } = useLocation()

//     const userRole: any = user?.authority?.[0]

//     const pages = [
//         { role: 'admin', pages: ['*'] },
//         { role: 'operator', pages: ['operator', 'account'] },
//         { role: 'seller', pages: ['seller', 'account', 'api'] },
//         { role: 'courier', pages: ['courier', 'account'] },
//         { role: 'warehouse', pages: ['warehouse', 'account' , 'orders'] },
//         { role: 'shop', pages: ['warehouse', 'account' , 'comments', 'settings' , 'seller' ,'collection' ] },
//     ]

//     function checkPathByRole(userRole: string, pathname: string): boolean {
//         if (!userRole || !pathname) return false

//         const roleEntry = pages.find((entry) => entry.role === userRole)
//         if (!roleEntry) return false

//         const allowedPages = roleEntry.pages

//         // "*" bo‘lsa, hamma sahifalarga ruxsat
//         if (allowedPages.includes('*')) return true

//         // Har bir allowed page ni path ichida bor-yo‘qligini tekshir
//         return allowedPages.some((page) => pathname.includes(page))
//     }
//     useEffect(() => {
//         if (!userRole || !pathname) return

//         const roleEntry = pages.find((entry) => entry.role === userRole)

//         if (!roleEntry) {
//             router(`/dashboards/${userRole}`)
//             return
//         }

//         const allowedPages = roleEntry.pages
//         const isAllowed =
//             allowedPages.includes('*') ||
//             allowedPages.some((page) => pathname.includes(page))

//         if (!isAllowed) {
//             router(`/dashboards/${userRole}`)
//         }
//     }, [userRole, pathname])

//     const roleMatched = useAuthority(userAuthority, authority)
//     const roleEntry = checkPathByRole(userRole, pathname)
//     // const isAdmin = userRole === 'admin'

//     return <>{roleEntry && roleMatched ? children : <Navigate to="/" />}</>
//     // return <>{isAdmin ? children : <Navigate to="/" />}</>
// }

// export default AuthorityGuard


import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: string[]
    authority?: string[]
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
    const { userAuthority = [], authority = [], children } = props

    const roleMatched = useAuthority(userAuthority, authority)

    return <>{roleMatched ? children : <Navigate to="/access-denied" />}</>
}

export default AuthorityGuard
