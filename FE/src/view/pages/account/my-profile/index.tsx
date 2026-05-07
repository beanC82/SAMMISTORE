"use client"

//React
import React, { useEffect } from 'react'

//Next
import { NextPage } from 'next'
import dynamic from 'next/dynamic'

//MUI
import { Avatar, FormHelperText, IconButton, InputLabel, useTheme } from '@mui/material'
import { Box, Button } from '@mui/material'

//Form
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

//Dynamic imports
const CustomTextField = dynamic(() => import('src/components/text-field'))
const FileUploadWrapper = dynamic(() => import('src/components/file-upload-wrapper'))
const IconifyIcon = dynamic(() => import('src/components/Icon'))
const CustomSelect = dynamic(() => import('src/components/custom-select'))
const CustomModal = dynamic(() => import('src/components/custom-modal'))
const CustomBreadcrumbs = dynamic(() => import('src/components/custom-breadcrum'))
const Spinner = dynamic(() => import('src/components/spinner'))

//Configs
import { EMAIL_REG } from 'src/configs/regex'
import { Grid } from '@mui/material'

//Translate
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

//Service
import { getAuthMe, getLoginUser, updateProfile } from 'src/services/auth'

//Types
import { UserDataType } from 'src/contexts/types'

//until
import { convertBase64, separationFullname, toFullName } from 'src/utils'

//Redux
import { AppDispatch, RootState } from 'src/stores'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfileAsync } from 'src/stores/auth/action'
import { resetInitialState } from 'src/stores/auth'

//Other
import { toast } from 'react-toastify'
import { getAllRoles } from 'src/services/role'
import { useAuth } from 'src/hooks/useAuth'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Khởi tạo plugin dayjs
dayjs.extend(utc)
dayjs.extend(timezone)


type TProps = {}

interface TDefaultValues {
    email: string
    phone: string
    firstName: string
    lastName: string
    gender: number
    birthday: string
}

const MyProfilePage: NextPage<TProps> = () => {
    //States
    const [loading, setLoading] = React.useState<boolean>(false)
    const [avatar, setAvatar] = React.useState<string>('')

    //hooks
    const { setUser } = useAuth()
    const { i18n } = useTranslation();

    //Theme
    const theme = useTheme();

    //Dispatch
    const dispatch: AppDispatch = useDispatch();
    const { isLoading, isErrorUpdateProfile, errorMessageUpdateProfile, isSuccessUpdateProfile } = useSelector((state: RootState) => state.auth)

    const schema = yup.object().shape({
        email: yup
            .string()
            .required(t("required_email"))
            .matches(EMAIL_REG, t("incorrect_email_format")),
        firstName: yup.string().required(t("required_first_name")),
        lastName: yup.string().required(t("required_last_name")),
        phone: yup.string().required(t("required_phone_number")).min(10, t("incorrect_phone_format")),
        gender: yup.number().required(t("required_gender")),
        birthday: yup.string().required(t("required_birthday")),
    });

    const defaultValues: TDefaultValues = {
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        gender: 1,
        birthday: '',
    }

    const { handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    // Sửa hàm formatDate
    const formatDisplayDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        const date = dayjs(dateString);
        return date.isValid() ? date.format('YYYY-MM-DD') : '';
    };

    // Sửa fetchGetAuthMe()
    const fetchGetAuthMe = async () => {
        setLoading(true)
        await getLoginUser()
            .then(async response => {
                setLoading(false)
                const data = response?.result
                if (data) {
                    let formattedBirthday = '';
                    if (data.birthday) {

                        // Sử dụng dayjs thay vì date-fns
                        const date = dayjs(data.birthday).tz('Asia/Ho_Chi_Minh');
                        formattedBirthday = date.isValid() ? date.format('YYYY-MM-DD') : '';
                    }

                    reset({
                        email: data?.email,
                        phone: data?.phone,
                        firstName: data?.firstName,
                        lastName: data?.lastName,
                        gender: data?.gender,
                        birthday: formattedBirthday,
                    })
                    setAvatar(data?.avatar)
                    setUser({ ...data })
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchGetAuthMe()
    }, [i18n.language])

    useEffect(() => {
        if (isSuccessUpdateProfile) {
            toast.success(t("update_profile_success"))
            fetchGetAuthMe()
        } else if (isErrorUpdateProfile && errorMessageUpdateProfile) {
            toast.error(errorMessageUpdateProfile)
        }
        dispatch(resetInitialState())
    }, [isErrorUpdateProfile, isSuccessUpdateProfile, errorMessageUpdateProfile])

    const onSubmit = (data: any) => {
        let formattedBirthday = data.birthday;
        if (data.birthday) {
            // Sử dụng dayjs thay vì date-fns
            const date = dayjs(data.birthday).tz('Asia/Ho_Chi_Minh');
            formattedBirthday = date.isValid() ? date.format('YYYY-MM-DD') : data.birthday;
        }
        dispatch(updateProfileAsync({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            gender: data.gender,
            birthday: formattedBirthday,
        }))
    }

    const handleUploadAvatar = async (file: File) => {
        const base64 = await convertBase64(file)
        setAvatar(base64 as string)
    }

    return (
        <Box sx={{
            maxWidth: '1440px',
            margin: '0 auto',
            width: '100%',
        }}>
            {loading || isLoading && <Spinner />}
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate >
                <Box sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    margin: "0 auto",
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: "15px",
                    py: 5, px: 4,
                }}>
                    <Grid container md={12} xs={12} spacing={6} sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        paddingRight: "1.5rem"
                    }} >
                        <Grid item md={12} xs={12}>
                            <Box sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: 2,
                            }}>
                                <Box sx={{
                                    position: "relative",
                                }}>
                                    {avatar && (
                                        <IconButton
                                            sx={{
                                                position: "absolute",
                                                bottom: -4,
                                                right: -6,
                                                zIndex: 2,
                                                color: theme.palette.error.main
                                            }}
                                            edge="start"
                                            color="inherit"
                                            aria-label="delete-avatar"
                                            onClick={() => setAvatar('')}
                                        >
                                            <IconifyIcon icon="material-symbols:delete-rounded" />
                                        </IconButton>
                                    )}
                                    {avatar ? (
                                        <Avatar src={avatar} alt="avatar" sx={{ width: 100, height: 100 }}>
                                            <IconifyIcon icon="ph:user-thin" fontSize={70} />
                                        </Avatar>
                                    ) : (
                                        <Avatar alt="default-avatar" sx={{ width: 100, height: 100 }}>
                                            <IconifyIcon icon="ph:user-thin" fontSize={70} />
                                        </Avatar>
                                    )}
                                </Box>
                                <FileUploadWrapper uploadFile={handleUploadAvatar} objectAcceptedFile={{
                                    "image/jpeg": [".jpg", ".jpeg"],
                                    "image/png": [".png"]
                                }}>
                                    <Button variant="outlined" sx={{
                                        width: "auto",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 1
                                    }}>
                                        <IconifyIcon icon="ph:camera-thin" />
                                        {avatar ? t('change_avatar') : t('upload_avatar')}
                                    </Button>
                                </FileUploadWrapper>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={12} >
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomTextField
                                        required
                                        fullWidth
                                        label={t('first_name')}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        placeholder={t('enter_your_first_name')}
                                        error={errors.firstName ? true : false}
                                        helperText={errors.firstName?.message}
                                    />
                                )}
                                name='firstName'
                            />
                        </Grid>
                        <Grid item md={6} xs={12} >
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomTextField
                                        required
                                        fullWidth
                                        label={t('last_name')}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        placeholder={t('enter_your_last_name')}
                                        error={errors.lastName ? true : false}
                                        helperText={errors.lastName?.message}
                                    />
                                )}
                                name='lastName'
                            />
                        </Grid>
                        <Grid item md={6} xs={12} >
                            <Controller
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomTextField
                                        required
                                        fullWidth
                                        label="Email"
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        placeholder={t('enter_your_email')}
                                        error={errors.email ? true : false}
                                        helperText={errors.email?.message}
                                    />
                                )}
                                name='email'
                            />
                        </Grid>

                        <Grid item md={6} xs={12} >
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomTextField
                                        required
                                        fullWidth
                                        label={t('phone_number')}
                                        onChange={(e) => {
                                            const numberValue = e.target.value.replace(/\D/g, '');
                                            onChange(numberValue);
                                        }}
                                        onBlur={onBlur}
                                        inputProps={{
                                            inputMode: 'numeric',
                                            pattern: '[0-9]*',
                                            minLength: 10
                                        }}
                                        value={value}
                                        placeholder={t('enter_your_phone_number')}
                                        error={errors.phone ? true : false}
                                        helperText={errors.phone?.message}
                                    />
                                )}
                                name='phone'
                            />
                        </Grid>

                        <Grid item md={6} xs={12} >
                            <Controller
                                control={control}
                                name='gender'
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Box sx={{
                                        mt: -5
                                    }}>
                                        <InputLabel sx={{
                                            fontSize: "13px",
                                            mb: "4px",
                                            display: "block",
                                            color: errors?.gender ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                        }}>
                                            {t('gender')}
                                        </InputLabel>
                                        <CustomSelect
                                            fullWidth
                                            variant="outlined"
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            options={[
                                                { label: t('male'), value: 1 },
                                                { label: t('female'), value: 2 }
                                            ]}
                                            placeholder={t('select_gender')}
                                            error={errors.gender ? true : false}
                                        />
                                        {errors?.gender?.message && (
                                            <FormHelperText sx={{
                                                color: !errors?.gender ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                            }}>
                                                {errors?.gender?.message}
                                            </FormHelperText>
                                        )}
                                    </Box>
                                )}
                            />
                        </Grid>
                        <Grid item md={6} xs={12} >
                            <Controller
                                control={control}
                                name='birthday'
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomTextField
                                        required
                                        fullWidth
                                        type="date"
                                        label={t('birthday')}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value ? new Date(value).toISOString().split('T')[0] : ''}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        error={errors.birthday ? true : false}
                                        helperText={errors.birthday?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                        paddingRight: "1.5rem"
                    }}>
                        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                            {t('update')}
                        </Button>
                    </Box>
                </Box>
            </form>
        </Box>
    )
}

export default MyProfilePage
