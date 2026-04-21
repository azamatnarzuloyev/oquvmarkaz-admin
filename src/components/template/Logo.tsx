import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const LogoIcon = () => (
    <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-md flex items-center justify-center">
            <span className="text-white font-black text-sm leading-none select-none">O</span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white" />
    </div>
)

const Logo = (props: LogoProps) => {
    const { type = 'full', className, style, logoWidth = '240px' } = props

    return (
        <div
            className={classNames('logo', className)}
            style={{ ...style, width: logoWidth }}
        >
            {type === 'full' ? (
                <div className="flex items-center gap-2.5">
                    <LogoIcon />
                    <div className="flex flex-col leading-none">
                        <span className="font-extrabold text-[15px] text-gray-900 dark:text-white tracking-tight">
                            O'quv Markaz
                        </span>
                        <span className="text-[10px] text-indigo-500 font-semibold tracking-widest uppercase">
                            CRM
                        </span>
                    </div>
                </div>
            ) : (
                <LogoIcon />
            )}
        </div>
    )
}

export default Logo
