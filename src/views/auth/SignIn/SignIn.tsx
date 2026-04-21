import { LogoSvg } from '@/assets/svg/logo'
import SignInForm from './components/SignInForm'
import { Card } from '@/components/ui'

type SignInProps = {
    signUpUrl?: string
    forgetPasswordUrl?: string
    disableSubmit?: boolean
}

export const SignInBase = ({ disableSubmit }: SignInProps) => {
    return (
        <Card className=" w-full flex items-center justify-center min-h-[370px]">
            <div className="w-full max-xs:min-w-[350px] max-xss:min-w-[330px] min-w-[400px] ">
                <div className=" w-full  justify-center  flex items-center">
                    {/* <LogoSvg /> */}
                    <h4
                        className="text-xl pb-4"
                        style={{
                            color: 'rgb(35 25 113',
                        }}
                    >
                        XS ADMIN
                    </h4>
                </div>
                <SignInForm disableSubmit={disableSubmit} />
            </div>
        </Card>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
