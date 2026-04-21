import { lazy, Suspense } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SettingsMenu from './components/SettingsMenu'
import SettingMobileMenu from './components/SettingMobileMenu'
import useResponsive from '@/utils/hooks/useResponsive'
import { useSettingsStore } from './store/settingsStore'

const Profile = lazy(() => import('./components/SettingsProfile'))
const Security = lazy(() => import('./components/SettingsSecurity'))

const Settings = () => {
    const { currentView } = useSettingsStore()
    const { smaller, larger } = useResponsive()
    return (
        <AdaptiveCard className="h-full">
            <div className="flex flex-auto h-full">
                {larger.lg && (
                    <div className="'w-[200px] xl:w-[280px]">
                        <SettingsMenu />
                    </div>
                )}
                <div className="ltr:xl:pl-6 rtl:xl:pr-6 flex-1 py-2">
                    {smaller.lg && (
                        <div className="mb-6">
                            <SettingMobileMenu />
                        </div>
                    )}
                    <Suspense fallback={<></>}>
                        {currentView === 'profile' && <Profile />}
                        {currentView === 'security' && <Security />}
                    </Suspense>
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default Settings
