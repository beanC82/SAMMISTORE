//react
import { useEffect, useState } from "react"

//form
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import * as yup from 'yup';

//Mui
import { Avatar, Box, Button, FormHelperText, Grid, IconButton, InputAdornment, Typography } from "@mui/material"
import { useTheme } from "@mui/material"
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

//components
import CustomModal from "src/components/custom-modal"
import IconifyIcon from "src/components/Icon"
import Spinner from "src/components/spinner"
import CustomTextField from "src/components/text-field"

//services
import { getUserDetail } from "src/services/user"

//translation
import { useTranslation } from "react-i18next"

//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import { createUserAsync, updateUserAsync } from "src/stores/user/action"
import { EMAIL_REG, PASSWORD_REG } from "src/configs/regex";
import FileUploadWrapper from "src/components/file-upload-wrapper";
import { convertBase64, separationFullname, toFullName } from "src/utils";
import { InputLabel } from "@mui/material";
import CustomSelect from "src/components/custom-select";
import { getAllRoles } from "src/services/role";


interface TCreateUpdateUser {
    open: boolean
    onClose: () => void
    idUser?: string
}

type TDefaultValues = {
    fullName: string,
    email: string,
    password?: string,
    phoneNumber: string,
    role: string,
    city?: string,
    address?: string,
    status?: number
}

const CreateUpdateUser = (props: TCreateUpdateUser) => {

    //state
    const [loading, setLoading] = useState(false)
    const [avatar, setAvatar] = useState("")
    const [roleOptions, setRoleOptions] = useState<{ label: string, value: string }[]>([])
    const [cityOptions, setCityOptions] = useState<{ label: string, value: string }[]>([])
    const [showPassword, setShowPassword] = useState(false)

    //props
    const { open, onClose, idUser } = props

    //translation
    const { t, i18n } = useTranslation()

    //theme
    const theme = useTheme()

    //redux
    const dispatch: AppDispatch = useDispatch()

    const schema = yup.object().shape({
        email: yup.string().required(t("required_email"))
            .matches(EMAIL_REG, t('incorrect_email_format')),
        password: idUser ? yup.string().nonNullable() : yup.string().required(t("required_password"))
            .matches(PASSWORD_REG, t('incorrect_password_format')),
        fullName: yup.string().required(t("required_fullname")),
        phoneNumber: yup.string().required(t('required_phone_number'))
            .min(10, t('incorrect_phone_format')),
        role: yup.string().required(t('require_role')),
        city: yup.string().nonNullable(),
        address: yup.string().nonNullable(),
        status: yup.number().nonNullable(),
    });

    const defaultValues: TDefaultValues = {
        fullName: '',
        email: '',
        password: '',
        role: '',
        phoneNumber: '',
        address: '',
        status: 1,
        city: '',
    }

    const { handleSubmit, control, formState: { errors }, reset } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });


    const onSubmit = (data: TDefaultValues) => {
        const { firstName, middleName, lastName } = separationFullname(data.fullName, i18n.language)
        if (!Object.keys(errors)?.length) {
            if (idUser) {
                //update
                dispatch(updateUserAsync({
                    firstName, middleName, lastName,
                    email: data?.email,
                    role: data?.role,
                    phoneNumber: data?.phoneNumber,
                    address: data?.address,
                    city: data?.city,
                    avatar: avatar,
                    id: Number(idUser),
                    status: data?.status ? 1 : 0,
                }))
            } else {
                //create
                dispatch(createUserAsync({
                    firstName, middleName, lastName,
                    email: data?.email,
                    password: data.password,
                    role: data?.role,
                    phoneNumber: data?.phoneNumber,
                    address: data?.address,
                    city: data?.city,
                    avatar: avatar
                }))
            }
        }
    }

    //handler
    const handleUploadAvatar = async (file: File) => {
        const base64 = await convertBase64(file)
        setAvatar(base64 as string)
    }

    const fetchDetailUser = async (id: number) => {
        setLoading(true)
        await getUserDetail(id).then((res) => {
            const data = res?.data
            if (data) {
                reset({
                    fullName: toFullName(data?.lastName, data?.middleName, data?.firstName, i18n.language),
                    email: data?.email,
                    password: data?.password,
                    role: data?.role._id,
                    phoneNumber: data?.phoneNumber,
                    address: data?.address,
                    city: data?.city,
                    status: data?.status
                })
                setAvatar(data?.avatar)
            }
            setLoading(false)
        }).catch((e) => {
            setLoading(false)
        })
    }


    const fetchAllRoles = async () => {
        setLoading(true)
        await getAllRoles({ params: { limit: -1, page: -1, search: '', order: '' } }).then((res) => {
            const data = res?.data?.roles
            if (data) {
                setRoleOptions(data?.map((item: { name: string, _id: string }) => ({
                    label: item.name,
                    value: item._id
                })))
            }
            setLoading(false)
        }).catch((err) => {
            setLoading(false)
        })
    }

    useEffect(() => {
        if (!open) {
            reset({
                ...defaultValues
            })
            setAvatar("")
            setShowPassword(false)
        } else {
            if (idUser && open) {
                fetchDetailUser(Number(idUser))
            }
        }
    }, [open, idUser])

    useEffect(() => {
        fetchAllRoles()
    }, [])

    return (
        <>
            {loading && <Spinner />}
            <CustomModal open={open} onClose={onClose}>
                <Box
                    sx={{
                        backgroundColor: theme.palette.customColors.bodyBg,
                        padding: '20px',
                        borderRadius: '15px',
                    }}
                    minWidth={{ md: '800px', xs: '80vw' }}
                    maxWidth={{ md: '80vw', xs: '80vw' }}
                >
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        paddingBottom: '20px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {idUser ? t('update_user') : t('create_user')}
                        </Typography>
                        <IconButton sx={{
                            position: 'absolute',
                            right: "-10px",
                            top: "-6px",
                        }}>
                            <IconifyIcon
                                icon="material-symbols-light:close-rounded"
                                fontSize={"30px"}
                                onClick={onClose}
                            />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate >
                        <Box
                            sx={{
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: "15px",
                                py: 5, px: 4
                            }}>
                            <Grid container
                                spacing={4}
                            >
                                <Grid container item md={6} xs={12}>
                                    <Box sx={{
                                        width: "100%",
                                        height: "100%",
                                    }}>
                                        <Grid container spacing={4}>
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
                                                    rules={{ required: true }}
                                                    render={({ field: { onChange, onBlur, value } }) => (
                                                        <CustomTextField
                                                            // 
                                                            required
                                                            fullWidth
                                                            label={t('email')}
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
                                            {!idUser && (
                                                <Grid item md={6} xs={12} >
                                                    <Controller
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field: { onChange, onBlur, value } }) => (
                                                            <CustomTextField
                                                                required
                                                                fullWidth
                                                                label={t("password")}
                                                                onChange={onChange}
                                                                onBlur={onBlur}
                                                                value={value}
                                                                placeholder={t('enter_your_password')}
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
                                                </Grid>
                                            )}
                                            <Grid item md={6} xs={12} >
                                                <Controller
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field: { onChange, onBlur, value } }) => (
                                                        <Box>
                                                            <InputLabel sx={{
                                                                fontSize: "13px",
                                                                mb: "4px",
                                                                display: "block",
                                                                color: errors?.role ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                            }}>
                                                                {t('role')}<span style={{
                                                                    color: errors?.role ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                                }}>*</span>
                                                            </InputLabel>
                                                            <CustomSelect
                                                                fullWidth
                                                                onChange={onChange}
                                                                onBlur={onBlur}
                                                                value={value}
                                                                options={roleOptions}
                                                                placeholder={t('select_your_role')}
                                                                error={errors.role ? true : false}
                                                            />
                                                            {!errors?.role?.message && (
                                                                <FormHelperText sx={{
                                                                    color: !errors?.role ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                                }}>
                                                                    {errors?.role?.message}
                                                                </FormHelperText>
                                                            )}
                                                        </Box>
                                                    )}
                                                    name='role'
                                                />
                                            </Grid>
                                            {idUser && (
                                                <Grid item md={6} xs={12} >
                                                    <Controller
                                                        control={control}
                                                        render={({ field: { onChange, onBlur, value } }) => {
                                                            return (
                                                                <FormControlLabel
                                                                    control={
                                                                        <Switch
                                                                            checked={Boolean(value)}
                                                                            value={value}
                                                                            onChange={
                                                                                (e) => onChange(e.target.checked ? 1 : 0)
                                                                            }
                                                                            sx={{
                                                                                '& .MuiSwitch-switchBase': {
                                                                                    color: theme.palette.common.white,
                                                                                },
                                                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                                                },
                                                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                                    backgroundColor: theme.palette.primary.main,
                                                                                },
                                                                                '& .MuiSwitch-track': {
                                                                                    backgroundColor: theme.palette.grey[400],
                                                                                },
                                                                            }}
                                                                        />
                                                                    }
                                                                    label={Boolean(value) ? t('active') : t('inactive')}
                                                                />
                                                            )
                                                        }}
                                                        name='status'
                                                    />
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                </Grid>
                                <Grid container item md={6} xs={12} >
                                    <Box>
                                        <Grid container spacing={5}>
                                            <Grid item md={12} xs={12} >
                                                <Controller
                                                    control={control}
                                                    render={({ field: { onChange, onBlur, value } }) => (
                                                        <CustomTextField
                                                            fullWidth
                                                            required
                                                            label={t('full_name')}
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            placeholder={t('enter_your_full_name')}
                                                            error={errors.fullName ? true : false}
                                                            helperText={errors.fullName?.message}
                                                        />
                                                    )}
                                                    name='fullName'
                                                />
                                            </Grid>
                                            <Grid item md={12} xs={12} >
                                                <Controller
                                                    control={control}
                                                    name='address'
                                                    render={({ field: { onChange, onBlur, value } }) => (
                                                        <CustomTextField
                                                            fullWidth
                                                            label={t('address')}
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            placeholder={t('enter_your_address')}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item md={12} xs={12} >
                                                <Controller
                                                    control={control}
                                                    name='city'
                                                    render={({ field: { onChange, onBlur, value } }) => (
                                                        <Box>
                                                            <InputLabel sx={{
                                                                fontSize: "13px",
                                                                mb: "4px",
                                                                display: "block",
                                                                color: errors?.city ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                            }}>
                                                                {t('city')}
                                                            </InputLabel>
                                                            <CustomSelect
                                                                fullWidth
                                                                onChange={onChange}
                                                                onBlur={onBlur}
                                                                value={value}
                                                                options={cityOptions}
                                                                placeholder={t('select_your_city')}
                                                                error={errors.city ? true : false}
                                                            />
                                                            {errors?.city?.message && (
                                                                <FormHelperText sx={{
                                                                    color: errors?.city ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                                }}>
                                                                    {errors?.city?.message}
                                                                </FormHelperText>
                                                            )}
                                                        </Box>
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item md={12} xs={12} >
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
                                                                minLength: 8
                                                            }}
                                                            value={value}
                                                            placeholder={t('enter_your_phone_number')}
                                                            error={errors.phoneNumber ? true : false}
                                                            helperText={errors.phoneNumber?.message}
                                                        />
                                                    )}
                                                    name='phoneNumber'
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                                {idUser ? t('update') : t('create')}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </CustomModal>
        </>
    )
}

export default CreateUpdateUser