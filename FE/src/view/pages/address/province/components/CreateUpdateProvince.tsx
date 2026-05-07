//react
import { useEffect, useState } from "react"

//form
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import * as yup from 'yup';

//Mui
import { Box, Button, Grid, IconButton, Typography } from "@mui/material"
import { useTheme } from "@mui/material"

//components
import CustomModal from "src/components/custom-modal"
import IconifyIcon from "src/components/Icon"
import Spinner from "src/components/spinner"
import CustomTextField from "src/components/text-field"

//services
import { getProvinceDetail } from "src/services/province"

//translation
import { useTranslation } from "react-i18next"
//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import { createProvinceAsync, updateProvinceAsync } from "src/stores/province/action"

interface TCreateUpdateProvince {
    open: boolean
    onClose: () => void
    id?: number
}

type TDefaultValues = {
    name: string,
    code: string,
    postalCode: string
}

const CreateUpdateProvince = (props: TCreateUpdateProvince) => {

    //state
    const [loading, setLoading] = useState(false)

    //props
    const { open, onClose, id } = props

    //translation
    const { t, i18n } = useTranslation()

    //theme
    const theme = useTheme()

    //redux
    const dispatch: AppDispatch = useDispatch()

    const schema = yup.object().shape({
        name: yup.string().required(t('required_province_name')),
        code: yup.string().required(t('required_province_code')),
        postalCode: yup.string().required(t('required_postal_code'))
    });

    const defaultValues: TDefaultValues = {
        name: '',
        code: '',
        postalCode: ''
    }

    const { handleSubmit, control, formState: { errors }, reset } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });


    const onSubmit = (data: TDefaultValues) => {
        if (!Object.keys(errors)?.length) {
            if (id) {
                //update
                dispatch(updateProvinceAsync({
                    name: data?.name,
                    code: data?.code,
                    postalCode: data?.postalCode,
                    id: id,
                }))
            } else {
                //create
                dispatch(createProvinceAsync({
                    name: data?.name,
                    code: data?.code,
                    postalCode: data?.postalCode,
                }))
            }
        }
    }


    const fetchDetailProvince = async (id: number) => {
        setLoading(true)
        await getProvinceDetail(id).then((res) => {
            const data = res?.result
            if (data) {
                reset({
                    name: data?.name,
                    code: data?.code,
                    postalCode: data?.postalCode
                })
            }
            setLoading(false)
        }).catch((e) => {
            setLoading(false)
        })
    }

    useEffect(() => {
        if (!open) {
            reset({
                ...defaultValues
            })
        } else {
            if (id && open) {
                fetchDetailProvince(id)
            }
        }
    }, [open, id])

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
                    minWidth={{ md: '400px', xs: '80vw' }}
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
                            {id ? t('update_province') : t('create_province')}
                        </Typography>
                        <IconButton sx={{
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
                            <Grid container item md={12} xs={12} spacing={6}>
                                <Grid item md={12} xs={12} >
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomTextField
                                                fullWidth
                                                required
                                                label={t('province_name')}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_province_name')}
                                                error={errors.name ? true : false}
                                                helperText={errors.name?.message}
                                            />
                                        )}
                                        name='name'
                                    />
                                </Grid>
                                <Grid item md={12} xs={12} >
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomTextField
                                                fullWidth
                                                required
                                                label={t('province_code')}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_province_code')}
                                                error={errors.code ? true : false}
                                                helperText={errors.code?.message}
                                            />
                                        )}
                                        name='code'
                                    />
                                </Grid>
                                <Grid item md={12} xs={12} >
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomTextField
                                                fullWidth
                                                required
                                                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                                                onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                                                label={t('postal_code')}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_postal_code')}
                                                error={errors.postalCode ? true : false}
                                                helperText={errors.postalCode?.message}
                                            />
                                        )}
                                        name='postalCode'
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
                            <Button variant="outlined" sx={{ mt: 3, mb: 2, ml: 2, py: 1.5 }} onClick={onClose}>{t('cancel')}</Button>
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

export default CreateUpdateProvince