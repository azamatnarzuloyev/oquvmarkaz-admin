export type SignInCredential = {
    phone: string
    password: string
}

// Django backend dan keladigan response
export type DjangoUser = {
    id: number
    phone: string
    first_name: string
    last_name: string
    full_name: string
    role: 'admin' | 'reception' | 'teacher' | 'student'
    avatar: string | null
    is_active: boolean
}

export type DjangoTokens = {
    access: string
    refresh: string
}

export type SignInResponse = {
    success: boolean
    user: DjangoUser
    tokens: DjangoTokens
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type User = {
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    authority?: string[]
    user_id?: string | null
}

export type Token = {
    accessToken: string
    refreshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
