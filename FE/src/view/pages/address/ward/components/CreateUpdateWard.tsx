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
import { getWardDetail } from "src/services/ward"

//translation
import { useTranslation } from "react-i18next"
//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import { createWardAsync, updateWardAsync } from "src/stores/ward/action"
import { InputLabel } from "@mui/material";
import CustomSelect from "src/components/custom-select";
import { FormHelperText } from "@mui/material";
import { getAllDistricts } from "src/services/district";

interface TCreateUpdateWard {
    open: boolean
    onClose: () => void
    id?: number
}

type TDefaultValues = {
    name: string,
    code: string,
    districtId: number,
    districtName: string,
}

const CreateUpdateWard = (props: TCreateUpdateWard) => {

    //state
    const [loading, setLoading] = useState(false)
    const [districtOptions, setDistrictOptions] = useState<{ label: string, value: string }[]>([])

    //props
    const { open, onClose, id } = props

    //translation
    const { t, i18n } = useTranslation()

    //theme
    const theme = useTheme()

    //redux
    const dispatch: AppDispatch = useDispatch()

    const schema = yup.object().shape({
        name: yup.string().required(t('required_ward_name')),
        code: yup.string().required(t('required_ward_code')),
        districtId: yup.number().required(t('required_district_id')),
        districtName: yup.string().required(t('required_district_name')),
    });

    const defaultValues: TDefaultValues = {
        name: '',   
        code: '',
        districtId: 0,
        districtName: ''
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
                dispatch(updateWardAsync({
                    name: data?.name,
                    code: data?.code,
                    districtId: data?.districtId,
                    districtName: data?.districtName,
                    id: id,
                }))
            } else {
                //create
                dispatch(createWardAsync({
                    name: data?.name,
                    code: data?.code,
                    districtId: data?.districtId,
                    districtName: data?.districtName,
                }))
            }
        }
    }


    const fetchAllDistrict = async () => {
        setLoading(true)
        await getAllDistricts({
            params: {
                take: -1,
                skip: 0,
                paging: false,
                orderBy: "name",
                dir: "asc",
                keywords: "''",
                filters: ""
            }
        }).then((res) => {
            const data = res?.result?.subset
            if (data) {
                setDistrictOptions(data?.map((item: { name: string, id: string }) => ({
                    label: item.name,
                    value: item.id
                })))
            }
            setLoading(false)
        }).catch((err) => {
            setLoading(false)
        })
    }


    const fetchDetailWard = async (id: number) => {
        setLoading(true)
        await getWardDetail(id).then((res) => {
            const data = res?.result
            if (data) {
                reset({
                    name: data?.name,
                    code: data?.code,
                    districtId: data?.districtId,
                    districtName: data?.districtName
                })
            }
            setLoading(false)
        }).catch((e) => {
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchAllDistrict()
    }, [])

    useEffect(() => {
        if (!open) {
            reset({
                ...defaultValues
            })
        } else {
            if (id && open) {
                fetchDetailWard(id)
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
                            {id ? t('update_ward') : t('create_ward')}
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
                            <Grid container item md={12} xs={12} spacing={6}>
                                <Grid item md={12} xs={12} >
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomTextField
                                                fullWidth
                                                required
                                                label={t('ward_name')}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_ward_name')}
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
                                                label={t('ward_code')}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_ward_code')}
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
                                                disabled
                                                label={t('district_id')}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_district_id')}
                                                error={errors.districtId ? true : false}
                                                helperText={errors.districtId?.message}
                                            />
                                        )}
                                        name='districtId'
                                    />
                                </Grid>
                                <Grid item md={12} xs={12} >
                                    <Controller
                                        control={control}
                                        name='districtName'
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <Box sx={{
                                                mt: -5
                                            }}>
                                                <InputLabel sx={{
                                                    fontSize: "13px",
                                                    mb: "4px",
                                                    display: "block",
                                                    color: errors?.districtName ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                }}>
                                                    {t('district_name')}
                                                </InputLabel>
                                                <CustomSelect
                                                    fullWidth
                                                    onChange={(e) => {
                                                        const selectedDistrict = districtOptions.find(opt => opt.value === e.target.value);
                                                        console.log("id", selectedDistrict);
                                                        if (selectedDistrict) {
                                                            onChange(selectedDistrict.value);
                                                            setValue('districtId', parseInt(selectedDistrict.value));
                                                        } else {
                                                            onChange(0);
                                                            setValue('districtId', 0);
                                                        }
                                                    }}
                                                    onBlur={onBlur}
                                                    value={value || 0}
                                                    options={districtOptions}
                                                    placeholder={t('enter_district_name')}
                                                    error={errors.districtName ? true : false}
                                                />
                                                {errors?.districtName?.message && (
                                                    <FormHelperText sx={{
                                                        color: errors?.districtName ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                    }}>
                                                        {errors?.districtName?.message}
                                                    </FormHelperText>
                                                )}
                                            </Box>
                                        )}
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

export default CreateUpdateWard