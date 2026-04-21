import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'
import img from '../../../../public/company.png'
type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full py-5   flex-col justify-center items-center bg-white dark:bg-gray-800">
            <div className=" flex flex-col justify-center items-center flex-1 w-full">
                <div className="w-full max-w-[450px] max-xs:px-1 ">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Side
