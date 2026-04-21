import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { useSessionUser, useToken } from '@/store/authStore'
import { usePost } from '@/service/post.service'
import { Notification, toast } from '@/components/ui'
import type { SignInResponse } from '@/@types/auth'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
}

type SignInFormSchema = {
    phone: string
    password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    phone: z
        .string()
        .min(1, 'Telefon raqam kiriting')
        .regex(/^\+998\d{9}$/, 'Format: +998XXXXXXXXX'),
    password: z.string().min(1, 'Parol kiriting'),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const { disableSubmit = false, className, passwordHint } = props
    const { mutate: Login } = usePost('login')
    const { setUser, setSessionSignedIn } = useSessionUser()
    const { setToken, setRefreshToken } = useToken()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: { phone: '+998', password: '' },
    })

    const handleSubmitUser = (values: SignInFormSchema) => {
        setSubmitting(true)
        Login(
            { body: values, url: '/auth/login/' },
            {
                onSuccess: (res: SignInResponse & { error?: { message: string } }) => {
                    if (res?.success && res.user && res.tokens) {
                        const { first_name, last_name, role, id, avatar } = res.user
                        setToken(res.tokens.access)
                        setRefreshToken(res.tokens.refresh)
                        setUser({
                            userId: String(id),
                            user_id: String(id),
                            userName: `${first_name} ${last_name}`.trim(),
                            avatar: avatar ?? '',
                            authority: [role],
                        })
                        setSessionSignedIn(true)
                    } else {
                        const message =
                            res?.error?.message ?? 'Telefon yoki parol noto\'g\'ri'
                        toast.push(
                            <Notification title={message} type="danger" closable />,
                        )
                    }
                },
                onError: () => {
                    toast.push(
                        <Notification title="Server bilan bog'lanishda xatolik" type="danger" closable />,
                    )
                },
                onSettled: () => setSubmitting(false),
            },
        )
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(handleSubmitUser)}>
                <FormItem
                    label="Telefon raqam"
                    invalid={Boolean(errors.phone)}
                    errorMessage={errors.phone?.message}
                >
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="tel"
                                placeholder="+998901234567"
                                autoComplete="tel"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Parol"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="Parol"
                                autoComplete="current-password"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                {passwordHint}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    disabled={disableSubmit || isSubmitting}
                >
                    {isSubmitting ? 'Kirish...' : 'Kirish'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
