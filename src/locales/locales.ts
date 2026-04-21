import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './lang/uz.json'
import ru from './lang/ru.json'
import kr from './lang/kr.json'

import appConfig from '@/configs/app.config'

const resources = {
    uz: {
        translation: uz,
    },
    ru: {
        translation: ru,
    },
    kr: {
        translation: kr,
    },
}

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: appConfig.locale,
    lng: appConfig.locale,
    interpolation: {
        escapeValue: false,
    },
})

export const dateLocales: {
    [key: string]: () => Promise<ILocale>
} = {
    uz: () => import('dayjs/locale/uz'),
    ru: () => import('dayjs/locale/ru'),
    kr: () => import('dayjs/locale/uz'),
}

export default i18n
