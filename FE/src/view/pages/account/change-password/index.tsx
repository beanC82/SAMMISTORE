"use client"

//React
import React, { useEffect, useState } from 'react'

//Next
import { NextPage } from 'next'
import Image from 'next/image'

//MUI
import { IconButton, InputAdornment, useTheme } from '@mui/material'
import { Box, Button, Checkbox, CssBaseline, FormControlLabel, Typography } from '@mui/material'

//Form
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

//components
import CustomTextField from 'src/components/text-field'
import IconifyIcon from 'src/components/Icon'

//Configs
import { PASSWORD_REG } from 'src/configs/regex'


import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/stores'
import { changePasswordAsync } from 'src/stores/auth/action'

import { toast } from 'react-toastify'

import { resetInitialState } from 'src/stores/auth'
import { useRouter } from 'next/navigation'
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import Spinner from 'src/components/spinner'
import { changePasswordMe } from 'src/services/auth'
type TProps = {}

interface IDefaultValues {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}
const ChangePasswordPage: NextPage<TProps> = () => {
    //States
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // const [isRemember, setIsRemember] = useState(false);

    //router
    const router = useRouter();

    //auth
    const { logout } = useAuth()

    //Redux
    const dispatch: AppDispatch = useDispatch();
    //Theme
    const theme = useTheme();

    //translation
    const { t } = useTranslation()

    const schema = yup.object().shape({
        oldPassword: yup
            .string()
            .required(t("old_password_is_required"))
            .matches(PASSWORD_REG, t("the_old_password_format_is_incorrect")),
        newPassword: yup
            .string()
            .required(t("new_password_is_required"))
            .matches(PASSWORD_REG, t('incorrect_password_format')),
        confirmPassword: yup
            .string()
            .required(t("confirm_new_password_is_required"))
            .matches(PASSWORD_REG, t("incorrect_confirm_password_format"))
            .oneOf([yup.ref('newPassword'), ''], t("passwords_dot_not_match")),
    });

    const { handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data: { oldPassword: string, newPassword: string, confirmPassword: string }) => {
        if (!Object.keys(errors)?.length) {
            const res = await changePasswordMe({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            })

            if (res?.isSuccess) {
                toast.success(t("update_password_success"))
            }
            else {
                toast.error(res?.response?.data?.message)
            }
        }
    }

    return (
        <>
            <Box sx={{
                backgroundColor: theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px'
            }}>
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
                        <Typography component="h1" variant="h5">{t('change_password')}</Typography>
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate >
                            <Box sx={{ mt: 2 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('old_password')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_your_old_password')}
                                            helperText={errors.oldPassword?.message}
                                            error={errors.oldPassword ? true : false}
                                            type={showOldPassword ? 'text' : 'password'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label={
                                                                showOldPassword ? 'hide the password' : 'display the password'
                                                            }
                                                            edge="end"
                                                            onClick={() => setShowOldPassword(!showOldPassword)}>
                                                            {
                                                                showOldPassword ?
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
                                    name='oldPassword'
                                />
                            </Box>
                            <Box sx={{ mt: 2 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('new_password')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_your_password')}
                                            helperText={errors.newPassword?.message}
                                            error={errors.newPassword ? true : false}
                                            type={showNewPassword ? 'text' : 'password'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label={
                                                                showNewPassword ? 'hide the password' : 'display the password'
                                                            }
                                                            edge="end"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}>
                                                            {
                                                                showNewPassword ?
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
                                    name='newPassword'
                                />
                                {/* {errors.password && <Typography>{errors.password.message}</Typography>} */}
                            </Box>
                            <Box sx={{ mt: 2 }} width={{ md: '18rem', xs: '20rem' }}>
                                <Controller
                                    control={control}
                                    name='confirmPassword'
                                    rules={{ required: true }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            required
                                            fullWidth
                                            label={t('confirm_new_password')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('confirm_your_new_password')}
                                            helperText={errors.confirmPassword?.message}
                                            error={errors.confirmPassword ? true : false}
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
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                                {t('change_password')}
                            </Button>
                        </form>
                    </Box>
                </Box>
            </Box >
        </>
    )
}

export default ChangePasswordPage
