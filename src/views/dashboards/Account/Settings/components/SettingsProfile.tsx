import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { CustomerInfo } from '@/views/concepts/tabels/employees-table/types'
import { useAuth } from '@/auth'
import { useEffect, useState } from 'react'
import { cleanPhoneNumber, formatPhoneNumber } from '@/utils/hooks/usePhone'
import { useMask } from '@react-input/mask'
import { useUpdate } from '@/service/put.service'
import { Notification, toast } from '@/components/ui'
import { useSessionUser } from '@/store/authStore'

const validationSchema: ZodType<CustomerInfo> = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    position: z.string().min(1),
    phone: z.string().min(17),
})

const SettingsProfile = () => {
    const { mutate: updateUser } = useUpdate('user')
    const [isLoading, setisLoading] = useState(false)
    const { user, data } = useAuth()
    const { setUser } = useSessionUser()

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<CustomerInfo>({
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: CustomerInfo) => {
        const userInfo = {
            ...values,
            phone: cleanPhoneNumber(values.phone),
        }
        setisLoading(true)
        updateUser(
            {
                body: userInfo,
                url: `/users/${data?.id}/`,
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
                    setisLoading(false)
                },
            },
        )
    }

    useEffect(() => {
        reset({
            ...data,
            position: data?.role,
            phone: formatPhoneNumber(data?.phone),
        })
        setUser({
            ...user,
            avatar: data?.img,
            userName: data?.first_name + ' ' + data?.last_name,
        })
    }, [data])

    const inputRef = useMask({
        mask: '+998 __ ___ __ __',
        replacement: { _: /\d/ },
    })

    return (
        <>
            <h4 className="mb-8">Shaxsiy ma'lumotlar</h4>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormItem label="Isim" invalid={Boolean(errors.first_name)}>
                        <Controller
                            name="first_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Isim"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Familya"
                        invalid={Boolean(errors.last_name)}
                    >
                        <Controller
                            name="last_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Familya"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Lavozim"
                        invalid={Boolean(errors.position)}
                    >
                        <Controller
                            name="position"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Lavozim"
                                    disabled
                                    {...field}
                                    value={data?.role?.toUpperCase()}
                                    onChange={() => {}}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Telefon raqam"
                        invalid={Boolean(errors.phone)}
                    >
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Telefon raqam"
                                    {...field}
                                    ref={inputRef}
                                    // disabled
                                    value={formatPhoneNumber(
                                        field?.value || '+998',
                                    )}
                                    // onChange={() => {}}
                                />
                            )}
                        />
                    </FormItem>
                </div>
                <div className="flex justify-end">
                    <Button variant="solid" type="submit" loading={isLoading}>
                        Yangilash
                    </Button>
                </div>
            </Form>
        </>
    )
}

export default SettingsProfile
