import { useRef, useImperativeHandle, forwardRef } from 'react'
import AuthContext from './AuthContext'
import { useSessionUser, useToken } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getData } from '@/service/get.service'
import axios from 'axios'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>((_, ref) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
})

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const { token } = useToken()

    const authenticated = Boolean(token && signedIn)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const signOut = async () => {
        const refresh = localStorage.getItem('refreshToken')
        if (refresh) {
            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/logout/`,
                    { refresh },
                    { headers: { 'Content-Type': 'application/json' } },
                )
            } catch {
                // Token allaqachon yaroqsiz bo'lsa ham local tozalash davom etadi
            }
        }
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('sessionUser')
        window.location.href = '/sign-in'
    }

    const { data } = useQuery({
        queryKey: ['auth-me'],
        queryFn: () => getData(`/auth/me/`),
        enabled: authenticated,
        retry: false,
        // /auth/me/ 401 yoki 403 qaytarsa — avtomatik logout
        meta: { onUnauthorized: signOut },
    })

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                data: data,
                signOut,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

IsolatedNavigator.displayName = 'IsolatedNavigator'

export default AuthProvider
