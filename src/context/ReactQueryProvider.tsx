import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,       // 1 daqiqa: sahifalar orasida qayta so'rov yuborilmaydi
            gcTime: 5 * 60 * 1000,      // 5 daqiqa: cache xotirada saqlanadi
            retry: 1,                   // Xato bo'lsa 1 marta qayta urinadi
            refetchOnWindowFocus: false, // Oyna fokusida qayta so'rov yo'q
        },
        mutations: {
            retry: 0,
        },
    },
})

const ReactQueryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

export default ReactQueryProvider
