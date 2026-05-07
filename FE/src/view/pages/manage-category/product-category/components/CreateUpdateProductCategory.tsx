//react
import { useEffect, useState, lazy, Suspense, useMemo, useCallback } from "react"

//form
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import * as yup from 'yup';

//Mui
import { Box, Button, FormHelperText, Grid, IconButton, Typography, InputLabel } from "@mui/material"
import { useTheme } from "@mui/material"

//components - Dynamic imports for better performance
const CustomModal = lazy(() => import("src/components/custom-modal"))
const IconifyIcon = lazy(() => import("src/components/Icon"))
const Spinner = lazy(() => import("src/components/spinner"))
const CustomTextField = lazy(() => import("src/components/text-field"))
const CustomSelect = lazy(() => import("src/components/custom-select"))

//services
import { getAllProductCategories, getProductCategoryCode, getProductCategoryDetail } from "src/services/product-category"

//translation
import { useTranslation } from "react-i18next"
//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import { createProductCategoryAsync, updateProductCategoryAsync } from "src/stores/product-category/action"


interface TCreateUpdateProductCategory {
    open: boolean
    onClose: () => void
    id?: number
}

type TDefaultValues = {
    name: string,
    code: string,
    parentId: number,
    parentName: string,
    level: number
}

const CreateUpdateProductCategory = (props: TCreateUpdateProductCategory) => {
    //state
    const [loading, setLoading] = useState(false)
    const [parentOptions, setParentOptions] = useState<{ label: string, value: string }[]>([])
    const [productCategoryCode, setProductCategoryCode] = useState<string>("");

    //props
    const { open, onClose, id } = props

    //translation
    const { t } = useTranslation()

    //theme
    const theme = useTheme()

    //redux
    const dispatch: AppDispatch = useDispatch()

    const schema = useMemo(() => yup.object().shape({
        name: yup.string().required(t("required_product_category_name")),
        code: yup.string().required(t("required_product_category_code")),
        parentId: yup.number().required(t("required_product_category_parent_code")),
        parentName: yup.string().required(t("required_product_category_parent")),
        level: yup.number().required(t("required_product_category_level")),
    }), [t]);

    const defaultValues: TDefaultValues = {
        name: '',
        code: productCategoryCode,
        parentId: 0,
        parentName: '',
        level: 0
    }

    const { handleSubmit, getValues, setValue, control, formState: { errors }, reset } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const onSubmit = useCallback((data: TDefaultValues) => {
        if (!Object.keys(errors)?.length) {
            if (id) {
                //update
                dispatch(updateProductCategoryAsync({
                    name: data?.name,
                    code: data?.code,
                    parentId: data?.parentId,
                    parentName: data?.parentName,
                    level: data?.level,
                    id: id,
                }))
            } else {
                //create
                dispatch(createProductCategoryAsync({
                    name: data?.name,
                    code: data?.code,
                    parentId: data?.parentId,
                    parentName: data?.parentName,
                    level: data?.level,
                }))
            }
        }
    }, [dispatch, errors, id]);

    const fetchDetailProductCategory = async (id: number) => {
        setLoading(true)
        try {
            const res = await getProductCategoryDetail(id)
            const data = res?.result
            if (data) {
                reset({
                    name: data?.name,
                    code: data?.code,
                    parentId: data?.parentId,
                    parentName: data?.parentName,
                    level: data?.level,
                })
            }
        } catch (error) {
            console.error('Error fetching product category detail:', error)
        } finally {
            setLoading(false)
        }
    };

    const fetchAllCategories = async () => {
        setLoading(true)
        try {
            const res = await getAllProductCategories({
                params: {
                    take: -1,
                    skip: 0,
                    paging: false,  
                    orderBy: "name",
                    dir: "asc",
                    keywords: "''",
                    filters: ""
                }
            })
            const data = res?.result?.subset
            if (data) {
                setParentOptions(data?.map((item: { name: string, id: string }) => ({
                    label: item.name,
                    value: item.id
                })))
            }
        } catch (error) {
            console.error('Error fetching all categories:', error)
        } finally {
            setLoading(false)
        }
    };

    const getProductCategoryDefaultCode = async () => {
        try {
            const res = await getProductCategoryCode({
                params: { take: -1, skip: 0, filters: '', orderBy: 'createdDate', dir: 'asc', paging: false, keywords: "''" }
            });
            setProductCategoryCode(res?.result);
        } catch (error) {
            console.error('Error getting product category code:', error)
        }
    };

    useEffect(() => {
        fetchAllCategories()
        getProductCategoryDefaultCode()
    }, [])

    useEffect(() => {
        if (!open) {
            reset({
                ...defaultValues
            })
        } else {
            if (id && open) {
                fetchDetailProductCategory(id)
            }
        }
    }, [open, id])

    return (
        <>
            {loading && <Spinner />}
            <Suspense fallback={<Spinner />}>
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
                                {id ? t('update_product_category') : t('create_product_category')}
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
                                <Grid container item md={12} xs={12} spacing={5}>
                                    <Grid item md={12} xs={12} >
                                        <Controller
                                            control={control}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <CustomTextField
                                                    fullWidth
                                                    required
                                                    label={t('product_category_name')}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        onChange(value)
                                                    }}
                                                    onBlur={onBlur}
                                                    value={value}
                                                    placeholder={t('enter_product_category_name')}
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
                                                    label={t('product_category_code')}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    value={value || productCategoryCode}
                                                    placeholder={t('enter_product_category_code')}
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
                                                    disabled
                                                    required
                                                    label={t('product_category_parent_id')}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    value={value}
                                                    placeholder={t('enter_product_category_parent_id')}
                                                    error={errors.parentId ? true : false}
                                                    helperText={errors.parentId?.message}
                                                />
                                            )}
                                            name='parentId'
                                        />
                                    </Grid>
                                    <Grid item md={12} xs={12} >
                                        <Controller
                                            control={control}
                                            name='parentName'
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <Box sx={{
                                                    mt: -5
                                                }}>
                                                    <InputLabel sx={{
                                                        fontSize: "13px",
                                                        mb: "4px",
                                                        display: "block",
                                                        color: errors?.parentName ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                    }}>
                                                        {t('parent_name')}
                                                    </InputLabel>
                                                    <CustomSelect
                                                        fullWidth
                                                        onChange={(e) => {
                                                            const selectedParent = parentOptions.find(opt => opt.value === e.target.value);
                                                            if (selectedParent) {
                                                                onChange(selectedParent.value);
                                                                setValue('parentId', Number(selectedParent.value));
                                                            } else {
                                                                onChange('');
                                                                setValue('parentId', 0);
                                                            }
                                                        }}
                                                        onBlur={onBlur}
                                                        value={value || ''}
                                                        options={parentOptions}
                                                        placeholder={t('select_parent_name')}
                                                        error={errors.parentName ? true : false}
                                                    />
                                                    {errors?.parentName?.message && (
                                                        <FormHelperText sx={{
                                                            color: errors?.parentName ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.42)`
                                                        }}>
                                                            {errors?.parentName?.message}
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
                                                    fullWidth
                                                    required
                                                    label={t('product_category_level')}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    value={value}
                                                    placeholder={t('enter_product_category_level')}
                                                    error={errors.level ? true : false}
                                                    helperText={errors.level?.message}
                                                />
                                            )}
                                            name='level'
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
                        </form>
                    </Box>
                </CustomModal>
            </Suspense>
        </>
    )
}

export default CreateUpdateProductCategory