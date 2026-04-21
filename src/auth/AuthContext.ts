import { createContext } from 'react'
import type { User } from '@/@types/auth'

type Auth = {
    authenticated: boolean
    user: User
    data: any
    signOut: () => void
}

const AuthContext = createContext<Auth>({
    authenticated: false,
    user: {},
    data: {},
    signOut: () => {},
})

export default AuthContext
