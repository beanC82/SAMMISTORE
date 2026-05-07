//react
import { useEffect, useMemo, useState } from "react"
import dynamic from 'next/dynamic'

//form
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import * as yup from 'yup';

//Mui
import { Box, Button, FormHelperText, Grid, IconButton, InputLabel, Typography, Avatar, FormControlLabel, Switch } from "@mui/material"
import { useTheme } from "@mui/material"

//components
import CustomModal from "src/components/custom-modal"
import IconifyIcon from "src/components/Icon"
import Spinner from "src/components/spinner"
import CustomTextField from "src/components/text-field"
import FileUploadWrapper from "src/components/file-upload-wrapper"

//services
import { getBannerDetail } from "src/services/banner"

//translation
import { useTranslation } from "react-i18next"
//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import { createBannerAsync, updateBannerAsync } from "src/stores/banner/action"
import { BannerImage } from "src/types/banner";

//utils
import { convertBase64 } from "src/utils"

interface TCreateUpdateBanner {
    open: boolean
    onClose: () => void
    id?: number
}

type TDefaultValues = {
    name: string,
    level: number,
    imageCommand: BannerImage,
    isActive: boolean
}

const CreateUpdateBanner = (props: TCreateUpdateBanner) => {
    //state
    const [loading, setLoading] = useState(false)
    const [bannerImage, setBannerImage] = useState<BannerImage | null>(null)

    //props
    const { open, onClose, id } = props

    //translation
    const { t, i18n } = useTranslation()

    //theme
    const theme = useTheme()

    //redux
    const dispatch: AppDispatch = useDispatch()

    const schema = yup.object().shape({
        name: yup.string().required(t("required_banner_name")),
        level: yup.number().required(t("required_banner_level")),
        imageCommand: yup.object().shape({
            imageBase64: yup.string().default(""),
            imageUrl: yup.string().default(""),
            publicId: yup.string().default(""),
            typeImage: yup.string().default(""),
            value: yup.string().default(""),
        }),
        isActive: yup.boolean().default(true)
    });

    const defaultValues: TDefaultValues = {
        name: '',
        level: 0,
        imageCommand: {
            imageBase64: '',
            imageUrl: '',
            publicId: '',
            typeImage: '',
            value: '',
        },
        isActive: true
    }

    const { handleSubmit, control, formState: { errors }, reset, setValue } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const onSubmit = (data: TDefaultValues) => {
        if (!Object.keys(errors)?.length) {
            if (id) {
                //update
                dispatch(updateBannerAsync({
                    name: data?.name,
                    level: data?.level,
                    imageCommand: data?.imageCommand,
                    isActive: data?.isActive,
                    id: Number(id),
                }))
            } else {
                //create
                dispatch(createBannerAsync({
                    name: data?.name,
                    level: data?.level,
                    imageCommand: data?.imageCommand,
                    isActive: data?.isActive,
                }))
            }
        }
    }

    const fetchDetailBanner = async (id: number) => {
        setLoading(true)
        await getBannerDetail(id).then((res: any) => {
            const data = res?.result
            if (data) {
                reset({
                    name: data?.name,
                    level: data?.level,
                    imageCommand: {
                        imageBase64: data?.imageBase64,
                        imageUrl: data?.imageUrl,
                        publicId: '',
                        typeImage: data?.typeImage,
                        value: data?.value,
                    },
                    isActive: data?.isActive ?? true
                })
                setBannerImage({
                    imageUrl: data.imageUrl || '',
                    imageBase64: data.imageBase64 || '',
                    publicId: data.publicId || "''",
                    typeImage: data.typeImage || '',
                    value: data.value || '',
                })
            }
            setLoading(false)
        }).catch((e: any) => {
            setLoading(false)
        })
    }

    const handleUploadBannerImage = async (file: File) => {
        const base64WithPrefix = await convertBase64(file)
        const base64 = base64WithPrefix.split(",")[1]
        const newImage: BannerImage = {
            imageUrl: "",
            imageBase64: base64,
            publicId: "''",
            typeImage: file.type,
            value: file.name,
        }
        setBannerImage(newImage)
        setValue("imageCommand", newImage, { shouldValidate: true })
    }

    useEffect(() => {
        if (!open) {
            reset(defaultValues)
            setBannerImage(null)
        } else {
            if (id && open) {
                fetchDetailBanner(id)
            }
        }
    }, [open, id, reset])

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
                    minWidth={{ md: '500px', xs: '80vw' }}
                    maxWidth={{ md: '50vw', xs: '80vw' }}
                >
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        paddingBottom: '20px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {id ? t('update_banner') : t('create_banner')}
                        </Typography>
                        <IconButton 
                            sx={{
                                position: 'absolute',
                                right: "-10px",
                                top: "-6px",
                            }}
                            onClick={onClose}
                        >
                            <IconifyIcon
                                icon="material-symbols-light:close-rounded"
                                fontSize={"30px"}
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
                            <Grid container item md={12} xs={12} spacing={2}>
                                <Grid item md={12} xs={12} mb={2}>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 4 }}>
                                        {bannerImage ? (
                                            <Box sx={{ position: "relative" }}>
                                                <Avatar
                                                    src={bannerImage.imageBase64 ?
                                                        `data:image/${bannerImage.typeImage};base64,${bannerImage.imageBase64}`
                                                        : bannerImage.imageUrl
                                                    }
                                                    sx={{ width: 200, height: 100 }}
                                                    variant="rounded"
                                                    alt="banner-image"
                                                />
                                                <IconButton
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: -4,
                                                        right: -6,
                                                        color: theme.palette.error.main
                                                    }}
                                                    onClick={() => {
                                                        setBannerImage(null)
                                                        setValue("imageCommand", defaultValues.imageCommand, { shouldValidate: true })
                                                    }}
                                                >
                                                    <IconifyIcon icon="material-symbols:delete-rounded" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Avatar
                                                sx={{ width: 200, height: 100 }}
                                                variant="rounded"
                                                alt="default-banner-image"
                                            >
                                                <IconifyIcon icon="material-symbols:image-not-supported-rounded" />
                                            </Avatar>
                                        )}
                                        <FileUploadWrapper
                                            uploadFile={handleUploadBannerImage}
                                            objectAcceptedFile={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
                                        >
                                            <Button
                                                variant="outlined"
                                                sx={{ width: "auto", display: "flex", alignItems: "center", gap: 1 }}
                                            >
                                                <IconifyIcon icon="ph:camera-thin" />
                                                {bannerImage ? t("change_banner_image") : t("upload_banner_image")}
                                            </Button>
                                        </FileUploadWrapper>
                                        {errors.imageCommand?.imageBase64 && (
                                            <FormHelperText sx={{ color: theme.palette.error.main }}>
                                                {errors.imageCommand?.imageBase64?.message}
                                            </FormHelperText>
                                        )}
                                    </Box>
                                </Grid>

                                <Grid item md={12} xs={12} mb={2}>
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomTextField
                                                fullWidth
                                                required
                                                label={t('banner_name')}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_banner_name')}
                                                error={errors.name ? true : false}
                                                helperText={errors.name?.message}
                                            />
                                        )}
                                        name='name'
                                    />
                                </Grid>

                                <Grid item md={12} xs={12} mb={2}>
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomTextField
                                                fullWidth
                                                required
                                                label={t('banner_level')}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_banner_level')}
                                                error={errors.level ? true : false}
                                                helperText={errors.level?.message}
                                            />
                                        )}
                                        name='level'
                                    />
                                </Grid>

                                <Grid item md={12} xs={12} mb={2}>
                                    <Controller
                                        name="isActive"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <InputLabel>{t("status")}</InputLabel>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={Boolean(value)}
                                                            onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                                                            sx={{
                                                                '& .MuiSwitch-track': {
                                                                    color: theme.palette.primary.main,
                                                                    border: `1px solid ${theme.palette.primary.main}`,
                                                                    backgroundColor: theme.palette.primary.main,
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    }
                                                    label={Boolean(value) ? t("active") : t("inactive")}
                                                />
                                            </Box>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                                {id ? t('update') : t('create')}
                            </Button>
                        </Box>
                    </form >
                </Box >
            </CustomModal >
        </>
    )
}

export default dynamic(() => Promise.resolve(CreateUpdateBanner), {
    ssr: false
})