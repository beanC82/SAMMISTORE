"use client"

//React
import React, { useEffect, useState } from 'react'

//Next
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'

//MUI
import { IconButton, InputAdornment, useTheme } from '@mui/material'
import { Box, Button, CssBaseline, Typography } from '@mui/material'

//Form
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

//components
const CustomTextField = dynamic(() => import('src/components/text-field'))
const IconifyIcon = dynamic(() => import('src/components/Icon'))

//Configs
import { EMAIL_REG, PASSWORD_REG } from 'src/configs/regex'
import { ROUTE_CONFIG } from 'src/configs/route'

//Images
import RegisterDark from '/public/images/register-dark.png'
import RegisterLight from '/public/images/register-light.png'
import GoogleIcon from '/public/svgs/google.svg'
import FacebookIcon from '/public/svgs/facebook.svg'

//Redux
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/stores'
import { registerAuthAsync } from 'src/stores/auth/action'
import { resetInitialState } from 'src/stores/auth'

//Other
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

type TProps = {}

interface IDefaultValues {
    firstName: string
    lastName: string
    phone: string
    email: string
    username: string
    password: string
    rePassword: string
}
const RegisterPage: NextPage<TProps> = () => {
    //States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    //router
    const router = useRouter();

    //Redux
    const dispatch: AppDispatch = useDispatch();
    const { isLoading, isError, isSuccess, errorMessage } = useSelector((state: RootState) => state.auth)

    //Theme
    const theme = useTheme();

    //translation
    const { t } = useTranslation()

    const schema = yup.object().shape({
        firstName: yup.string().required(t("required_first_name")),
        lastName: yup.string().required(t("required_last_name")),
        phone: yup.string().required(t("required_phone")),
        email: yup
            .string()
            .required(t("required_email"))
            .matches(EMAIL_REG, t("incorrect_email_format")),
        username: yup.string().required(t("required_username")),
        password: yup
            .string()
            .required(t("required_password"))
            .matches(PASSWORD_REG, t("incorrect_password_format")),
        rePassword: yup
            .string()
            .required(t("required_confirm_password"))
            .matches(PASSWORD_REG, t("incorrect_confirm_password_format"))
            .oneOf([yup.ref('password'), ''], t('password_not_match')),
    });

    const { handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            username: '',
            password: '',
            rePassword: ''
        },
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const onSubmit = (data: IDefaultValues) => {
        if (!Object.keys(errors).length) {
            dispatch(registerAuthAsync(data))
        }
    }

    useEffect(() => {
        if (isSuccess) {
            toast.success(t('register_success'))
            router.push(ROUTE_CONFIG.LOGIN)
            dispatch(resetInitialState())
        } else if (isError && errorMessage) {
            toast.error(errorMessage)
            dispatch(resetInitialState())
        }
    }, [isError, isSuccess, errorMessage])

    return (
        <>
            <Box sx={{
                height: '100vh',
                width: '100vw',
                backgroundColor: theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px'
            }}>
                <Box
                    display={{
                        xs: 'none',
                        sm: 'flex',
                    }}
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        borderRadius: '20px',
                        height: '100%',
                        backgroundColor: theme.palette.customColors.bodyBg,
                        minWidth: '50vw',
                    }}>
                    <Image
                        className='w-auto h-auto'
                        priority
                        quality={100}
                        src={theme.palette.mode === 'light' ? RegisterLight : RegisterDark}
                        alt="Register-image" />
                </Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1
                }}>
                    <CssBaseline />
                    <Box sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <Typography component="h1" variant="h5">{t('register')}</Typography>
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate >
                            <Box sx={{ mt: 4 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('first_name')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_first_name')}
                                            error={errors.firstName ? true : false}
                                            helperText={errors.firstName?.message}
                                        />
                                    )}
                                    name='firstName'
                                />
                            </Box>
                            <Box sx={{ mt: 4 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('last_name')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_last_name')}
                                            error={errors.lastName ? true : false}
                                            helperText={errors.lastName?.message}
                                        />
                                    )}
                                    name='lastName'
                                />
                            </Box>
                            <Box sx={{ mt: 4 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('phone')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_phone')}
                                            error={errors.phone ? true : false}
                                            helperText={errors.phone?.message}
                                        />
                                    )}
                                    name='phone'
                                />
                            </Box>
                            <Box sx={{ mt: 4 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('email')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_email')}
                                            error={errors.email ? true : false}
                                            helperText={errors.email?.message}
                                        />
                                    )}
                                    name='email'
                                />
                            </Box>
                            <Box sx={{ mt: 4 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('username')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_username')}
                                            error={errors.username ? true : false}
                                            helperText={errors.username?.message}
                                        />
                                    )}
                                    name='username'
                                />
                            </Box>
                            <Box sx={{ mt: 4 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('password')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_password')}
                                            helperText={errors.password?.message}
                                            error={errors.password ? true : false}
                                            type={showPassword ? 'text' : 'password'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label={
                                                                showPassword ? 'hide the password' : 'display the password'
                                                            }
                                                            edge="end"
                                                            onClick={() => setShowPassword(!showPassword)}>
                                                            {
                                                                showPassword ?
                                                                    <IconifyIcon icon='material-symbols:visibility-outline' />
                                                                    :
                                                                    <IconifyIcon icon='material-symbols:visibility-off-outline-rounded' />
                                                            }
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                    name='password'
                                />
                            </Box>
                            <Box sx={{ mt: 4 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    name='rePassword'
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('confirm_password')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_confirm_password')}
                                            helperText={errors.rePassword?.message}
                                            error={errors.rePassword ? true : false}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label={
                                                                showConfirmPassword ? 'hide the confirm password' : 'display the confirm password'
                                                            }
                                                            edge="end"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                            {
                                                                showConfirmPassword ?
                                                                    <IconifyIcon icon='material-symbols:visibility-outline' />
                                                                    :
                                                                    <IconifyIcon icon='material-symbols:visibility-off-outline-rounded' />
                                                            }
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                                disabled={isLoading}
                            >
                                {isLoading ? t('loading') : t('register')}
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: "4px" }}>
                                <Typography>
                                    {t('already_have_an_account')}
                                </Typography>
                                <Link
                                    className={`text-[${theme.palette.primary.main}]`}
                                    href="/login">
                                    {t('login')}
                                </Link>
                            </Box>
                            <Typography sx={{ textAlign: 'center', mt: 2, mb: 2 }}>{t('or')}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: "10px" }}>
                                <IconButton sx={{ color: theme.palette.error.main }}
                                    aria-label="Social Icon" onClick={() => console.log('Register with google')}>
                                    <Image src={GoogleIcon} width={40} height={40} alt='google' />
                                </IconButton>
                                <IconButton sx={{ color: theme.palette.error.main }}
                                    aria-label="Social Icon" onClick={() => console.log('Register with facebook')}>
                                    <Image src={FacebookIcon} width={40} height={40} alt='facebook' />
                                </IconButton>
                            </Box>
                        </form>
                    </Box>
                </Box>
            </Box >
        </>
    )
}

export default RegisterPage
