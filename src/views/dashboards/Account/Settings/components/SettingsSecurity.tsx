import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Form, FormItem } from '@/components/ui/Form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { getData } from '@/service/get.service'
import { useAuth } from '@/auth'
import { useUpdate } from '@/service/put.service'
import { Notification, toast } from '@/components/ui'

type PasswordSchema = {
    login: string
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

const validationSchema: ZodType<PasswordSchema> = z
    .object({
        login: z.string().min(1),
        currentPassword: z.string().min(1),
        newPassword: z.string().min(1),
        confirmNewPassword: z.string().min(1),
    })
    .refine((data) => data.confirmNewPassword === data.newPassword, {
        path: ['confirmNewPassword'],
    })

const SettingsSecurity = () => {
    const [confirmationOpen, setConfirmationOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { user } = useAuth()
    const { data, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: () => getData(`/employees/id/?type=${user?.authority?.[0]}`),
    })

    const { data: userParol } = useQuery({
        queryKey: ['user/parol'],
        queryFn: () => getData(`/employees/parol?type=${user?.authority?.[0]}`),
    })

    const { mutate: updateUser } = useUpdate('user')

    const formRef = useRef<HTMLFormElement>(null)

    const {
        getValues,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<PasswordSchema>({
        resolver: zodResolver(validationSchema),
    })

    const handlePostSubmit = async () => {
        setIsSubmitting(true)
        updateUser(
            {
                body: {
                    ...data?.employe,
                    login: getValues()?.login,
                    password: getValues()?.confirmNewPassword,
                },
                url:
                    user?.authority?.[0] === 'admin'
                        ? `/admin/${data?.employe?._id}`
                        : `/employees/${data?.employe?._id}`,
            },
            {
                onSuccess: (res) => {
                    if (res?._id || res?.status === 200) {
                        toast.push(
                            <Notification
                                title={"Ma'lumotlar yangilandi"}
                                type="success"
                                closable
                            />,
                        )
                        reset({
                            confirmNewPassword: '',
                            currentPassword: '',
                            login: '',
                            newPassword: '',
                        })
                    }
                    if ([404, 500, 400].includes(res?.status)) {
                        toast.push(
                            <Notification
                                title={res?.response?.data?.message}
                                type="danger"
                                closable
                            />,
                        )
                    }
                },
                onSettled: () => {
                    setConfirmationOpen(false)
                    setIsSubmitting(false)
                },
            },
        )
    }

    const onSubmit = async () => {
        if (userParol?.password === getValues().currentPassword) {
            setConfirmationOpen(true)
        } else {
            toast.push(
                <Notification
                    title="Joriy parol xato"
                    type="danger"
                    closable
                />,
            )
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h4>Parol</h4>
                <p>
                    Esda tuting, parolingiz hisobingizga kirish uchun raqamli
                    kalitdir. Uni xavfsiz saqlang, uni himoya qiling!
                </p>
            </div>
            <Form
                ref={formRef}
                className="mb-8"
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormItem label="Kirirsh so'zi" invalid={Boolean(errors.login)}>
                    <Controller
                        name="login"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Kirirsh so'zi"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Joriy parol"
                    invalid={Boolean(errors.currentPassword)}
                >
                    <Controller
                        name="currentPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Yangi parol"
                    invalid={Boolean(errors.newPassword)}
                >
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Yangi parolni tasdiqlang"
                    invalid={Boolean(errors.confirmNewPassword)}
                >
                    <Controller
                        name="confirmNewPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex justify-end">
                    <Button variant="solid" type="submit">
                        Yangilash
                    </Button>
                </div>
            </Form>
            <ConfirmDialog
                isOpen={confirmationOpen}
                type="warning"
                title="Parolni yangilash"
                confirmText="Yangilash"
                cancelText="Bekor qilish"
                confirmButtonProps={{
                    loading: isSubmitting,
                    onClick: handlePostSubmit,
                }}
                onClose={() => setConfirmationOpen(false)}
                onRequestClose={() => setConfirmationOpen(false)}
                onCancel={() => setConfirmationOpen(false)}
            >
                <p>Parolingizni o'zgartirishni xohlaysizmi?</p>
            </ConfirmDialog>
        </div>
    )
}

export default SettingsSecurity
