export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/dashboards/control',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'uz',
    accessTokenPersistStrategy: 'localStorage',
    enableMock: false,
}

export default appConfig
