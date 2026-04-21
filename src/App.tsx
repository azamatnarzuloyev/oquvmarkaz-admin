import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import './locales'
import AllProvider from './provider'

function App() {
    return (
        <BrowserRouter>
            <Theme>
                <AllProvider>
                    <AuthProvider>
                        <Layout>
                            <Views />
                        </Layout>
                    </AuthProvider>
                </AllProvider>
            </Theme>
        </BrowserRouter>
    )
}

export default App
