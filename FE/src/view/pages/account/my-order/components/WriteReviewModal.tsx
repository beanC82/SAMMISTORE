//react
import { useEffect, useState } from "react"

//form
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import * as yup from 'yup';

//Mui
import { Box, Button, Grid, IconButton, InputAdornment, Rating, Typography, Paper, MenuItem, Stack } from "@mui/material"
import { useTheme } from "@mui/material"

//components
import CustomModal from "src/components/custom-modal"
import IconifyIcon from "src/components/Icon"
import Spinner from "src/components/spinner"
import CustomTextField from "src/components/text-field"
import FileUploadWrapper from "src/components/file-upload-wrapper"
import CustomTextArea from "src/components/text-area"
import Image from "src/components/image"

//services
import { getReviewDetail } from "src/services/review";

//translation
import { useTranslation } from "react-i18next"

//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import { createReviewAsync } from "src/stores/review/action";
import { TOrderDetail } from "src/types/order";
import { convertBase64 } from "src/utils"

interface TWriteReviewModal {
    open: boolean
    onClose: () => void
    orderId: number
    orderDetails: TOrderDetail[]
}

type TDefaultValues = {
    comment?: string,
    star: number,
    productId: number
}

const WriteReviewModal = (props: TWriteReviewModal) => {
    //state
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    //props
    const { open, onClose, orderId, orderDetails } = props

    //translation
    const { t, i18n } = useTranslation()

    //theme
    const theme = useTheme()

    //redux
    const dispatch: AppDispatch = useDispatch()

    const schema = yup.object().shape({
        comment: yup.string().optional(),
        star: yup.number().required(t("required_star")),
        productId: yup.number().required(t("required_product")),
    });

    const defaultValues: TDefaultValues = {
        comment: undefined,
        star: 0,
        productId: orderDetails[0]?.productId || 0
    }

    const { handleSubmit, getValues, setError, clearErrors, control, formState: { errors }, reset } = useForm<TDefaultValues>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const handleImageUpload = async (file: File) => {
        try {
            const base64WithPrefix = await convertBase64(file);
            const base64 = base64WithPrefix.split(",")[1];
            setImageFile(file);
            setImagePreview(base64WithPrefix);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    const onSubmit = (data: TDefaultValues) => {
        if (!Object.keys(errors)?.length) {
            if (data.productId && orderId) {
                const formData = {
                    productId: data.productId,
                    orderId: orderId,
                    rating: data?.star,
                    comment: data?.comment,
                }

                if (imageFile) {
                    const imageCommand = {
                        imageUrl: "",
                        imageBase64: imagePreview?.split(",")[1] || "",
                        publicId: "''",
                        typeImage: imageFile.type.split("/")[1],
                        value: "main"
                    }
                    dispatch(createReviewAsync({
                        ...formData,
                        imageCommand
                    }))
                } else {
                    dispatch(createReviewAsync(formData))
                }
            }
        }
    }

    useEffect(() => {
        if (!open) {
            reset({
                ...defaultValues
            })
            setImageFile(null)
            setImagePreview(null)
        }
    }, [open])

    return (
        <>
            {loading && <Spinner />}
            <CustomModal open={open} onClose={onClose}>
                <Paper
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        padding: '20px',
                        borderRadius: '15px',
                        minWidth: { md: '500px', xs: '90vw' },
                        maxWidth: { md: '600px', xs: '90vw' },
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {t('rate_product')}
                        </Typography>
                        <IconButton onClick={onClose}>
                            <IconifyIcon
                                icon="material-symbols-light:close-rounded"
                                fontSize={"24px"}
                            />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Controller
                                    control={control}   
                                    name="productId"
                                    render={({ field: { onChange, value } }) => (
                                        <CustomTextField
                                            select
                                            fullWidth
                                            label={t('select_product')}
                                            value={value || ''}
                                            onChange={onChange}
                                            error={!!errors.productId}
                                        >
                                            {orderDetails.map((item) => (
                                                <MenuItem key={item.productId} value={item.productId}>
                                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                                        <Image
                                                            src={item.imageUrl || '/public/svgs/placeholder.svg'}
                                                            sx={{ width: 40, height: 40, borderRadius: 1, flexShrink: 0 }}
                                                        />
                                                        <Typography sx={{ 
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            textWrap: 'wrap'
                                                        }}>
                                                            {item.productName}
                                                        </Typography>
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </CustomTextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        {t('rating')}
                                    </Typography>
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Rating 
                                                value={value} 
                                                onChange={(e, newValue) => onChange(newValue)}
                                                precision={1}
                                                size="large"
                                            />
                                        )}
                                        name='star'
                                    />
                                    {errors.star && (
                                        <Typography color="error" variant="caption">
                                            {errors.star.message}
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextArea
                                            required
                                            label={t('comment')}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t('enter_comment')}
                                            error={!!errors.comment}
                                            helperText={errors.comment?.message}
                                            minRows={4}
                                            maxRows={6}
                                        />
                                    )}
                                    name='comment'
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    {t('upload_image')}
                                </Typography>
                                <FileUploadWrapper
                                    uploadFile={handleImageUpload}
                                    objectAcceptedFile={{
                                        'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                                    }}
                                >
                                    <Box
                                        sx={{
                                            border: `2px dashed ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            p: 3,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main
                                            }
                                        }}
                                    >
                                        {imagePreview ? (
                                            <Box
                                                component="img"
                                                src={imagePreview}
                                                alt="Preview"
                                                sx={{
                                                    maxWidth: '100%',
                                                    margin: '0 auto',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        ) : (
                                            <Typography color="text.secondary">
                                                {t('drag_drop_image')}
                                            </Typography>
                                        )}
                                    </Box>
                                </FileUploadWrapper>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={onClose}
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                    >
                                        {t('submit')}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </CustomModal>
        </>
    )
}

export default WriteReviewModal