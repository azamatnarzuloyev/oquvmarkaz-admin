import useAuthority from '@/utils/hooks/useAuthority'
import type { CommonProps } from '@/@types/common'

interface AuthorityCheckProps extends CommonProps {
    userAuthority: string[]
    authority: string[]
    emptyCheck?: boolean
}

const AuthorityCheck = (props: AuthorityCheckProps) => {
    const {
        userAuthority = [],
        authority = [],
        children,
        emptyCheck = false,
    } = props

    const roleMatched = useAuthority(userAuthority, authority)

    return <>{emptyCheck ? roleMatched ? children : null : true ? children : null}</>
}

export default AuthorityCheck
