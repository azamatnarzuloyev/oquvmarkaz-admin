import ReactQueryProvider from '@/context/ReactQueryProvider'
import React from 'react'

const AllProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ReactQueryProvider>
            {children}
        </ReactQueryProvider>
    )
}

export default AllProvider
