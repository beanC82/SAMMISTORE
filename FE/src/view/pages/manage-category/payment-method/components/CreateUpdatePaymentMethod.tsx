//react
import { useEffect, useMemo, useState } from "react"

//form
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import * as yup from 'yup';

//Mui
import { Box, Button, FormHelperText, Grid, IconButton, InputLabel, Typography } from "@mui/material"
import { useTheme } from "@mui/material"

//components
import CustomModal from "src/components/custom-modal"
import IconifyIcon from "src/components/Icon"
import Spinner from "src/components/spinner"
import CustomTextField from "src/components/text-field"

//services
import { getPaymentMethodDetail } from "src/services/payment-method"

//translation
import { useTranslation } from "react-i18next"
//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import { createPaymentMethodAsync, updatePaymentMethodAsync } from "src/stores/payment-method/action"
import CustomSelect from "src/components/custom-select";
import { PAYMENT_METHOD } from "src/configs/payment";

interface TCreateUpdatePaymentMethod {
    open: boolean
    onClose: () => void
    id?: number
}

type TDefaultValues = {
    name: string,
}

const CreateUpdatePaymentMethod = (props: TCreateUpdatePaymentMethod) => {

    const ObjectPaymentMethod = PAYMENT_METHOD()

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
        name: yup.string().required(t("required_payment_method_name")),
    });

    const defaultValues: TDefaultValues = {
        name: '',
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
                dispatch(updatePaymentMethodAsync({
                    name: data?.name,
                    id: id,
                }))
            } else {
                //create
                dispatch(createPaymentMethodAsync({
                    name: data?.name,
                }))
            }
        }
    }


    const fetchDetailPaymentMethod = async (id: number) => {
        setLoading(true)
        await getPaymentMethodDetail(id).then((res) => {
            const data = res?.result
            if (data) {
                reset({
                    name: data?.name,
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
                fetchDetailPaymentMethod(id)
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
                            {id ? t('update_payment_method') : t('create_payment_method')}
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
                            <Grid container item md={12} xs={12} >
                                <Grid item md={12} xs={12} mb={2} >
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomTextField
                                                fullWidth

                                                required
                                                label={t('payment_method_name')}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder={t('enter_payment_method_name')}
                                                error={errors.name ? true : false}
                                                helperText={errors.name?.message}
                                            />
                                        )}
                                        name='name'
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

export default CreateUpdatePaymentMethod