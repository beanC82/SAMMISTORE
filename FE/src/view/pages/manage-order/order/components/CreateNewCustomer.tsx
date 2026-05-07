import React, { useEffect, useState, lazy, Suspense } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import {
    Box,
    Button,
    FormHelperText,
    Grid,
    IconButton,
    Typography,
    Paper,
    useTheme,
    FormControlLabel,
    Switch
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "src/stores";
import { createCustomerFaster } from "src/services/customer";
import { TParamsCreateCustomerFaster } from "src/types/customer";
import { toast } from "react-toastify";

const CustomTextField = lazy(() => import("src/components/text-field"));
const IconifyIcon = lazy(() => import("src/components/Icon"));
const Spinner = lazy(() => import("src/components/spinner"));
const CustomAutocomplete = lazy(() => import("src/components/custom-autocomplete"));

const MemoizedCustomTextField = React.memo(CustomTextField);
const MemoizedCustomAutocomplete = React.memo(CustomAutocomplete);

interface TCreateNewCustomer {
    onClose: () => void;
}

type TDefaultValues = {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string;
    gender: number;
    isActive: boolean;
    isDelete: boolean;
};

const CreateNewCustomer = (props: TCreateNewCustomer) => {
    const [loading, setLoading] = useState(false);
    const { onClose } = props;
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch: AppDispatch = useDispatch();

    const genderOptions = [
        { label: t('male'), value: 1 },
        { label: t('female'), value: 0 },
    ];

    // Schema validation for form
    const schema = yup.object().shape({
        firstName: yup.string().required(t("required_first_name")),
        lastName: yup.string().required(t("required_last_name")),
        email: yup.string()
            .email(t("incorrect_email_format"))
            .nullable()
            .default(null),
        phone: yup.string()
            .required(t("required_phone"))
            .matches(/^\d{10}$/, t("incorrect_phone_format")),
        gender: yup.number().required(t("required_gender")),
        isActive: yup.boolean().default(true),
        isDelete: yup.boolean().default(false),
    });

    const defaultValues: TDefaultValues = {
        firstName: "",
        lastName: "",
        email: null,
        phone: "",
        gender: 0,
        isActive: true,
        isDelete: false,
    };

    const {
        handleSubmit,
        control,
        formState: { errors },
        reset
    } = useForm<TDefaultValues>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const onSubmit: SubmitHandler<TDefaultValues> = async (data) => {
        try {
            setLoading(true);
            const response = await createCustomerFaster(data);
            if (response?.isSuccess) {
                toast.success(t('create_customer_success'));
                onClose();
            } else {
                toast.error(response?.message || t('create_customer_failed'));
            }
        } catch (error) {
            console.error('Error creating customer:', error);
            toast.error(t('create_customer_failed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reset(defaultValues);
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Suspense fallback={<Spinner />}>
                {loading && <Spinner />}
                <Paper
                    sx={{
                        p: 2,
                        maxHeight: '90vh',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: theme.palette.grey[100],
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: theme.palette.primary.main,
                            borderRadius: '4px',
                        },
                    }}
                >
                    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate>
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5">{t("create_customer")}</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="outlined" onClick={onClose}>
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                    {t("create")}
                                </Button>
                            </Box>
                        </Box>

                        {/* Form Fields */}
                        <Grid container spacing={3}>
                            {/* Left Column */}
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Controller
                                            name="firstName"
                                            control={control}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <MemoizedCustomTextField
                                                    fullWidth
                                                    required
                                                    label={t("first_name")}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    value={value}
                                                    placeholder={t("enter_first_name")}
                                                    error={!!errors.firstName}
                                                    helperText={errors.firstName?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Controller
                                            name="lastName"
                                            control={control}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <MemoizedCustomTextField
                                                    fullWidth
                                                    required
                                                    label={t("last_name")}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    value={value}
                                                    placeholder={t("enter_last_name")}
                                                    error={!!errors.lastName}
                                                    helperText={errors.lastName?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Controller
                                            name="email"
                                            control={control}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <MemoizedCustomTextField
                                                    fullWidth
                                                    label={t("email")}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    value={value || ''}
                                                    placeholder={t("enter_email")}
                                                    error={!!errors.email}
                                                    helperText={errors.email?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Right Column */}
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Controller
                                            name="phone"
                                            control={control}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <MemoizedCustomTextField
                                                    fullWidth
                                                    required
                                                    label={t("phone")}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    value={value}
                                                    placeholder={t("enter_phone")}
                                                    error={!!errors.phone}
                                                    helperText={errors.phone?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Controller
                                            name="gender"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <MemoizedCustomAutocomplete
                                                    options={genderOptions}
                                                    value={genderOptions.find(option => option.value === value) || null}
                                                    onChange={(newValue) => onChange(newValue?.value ?? 0)}
                                                    label={t("gender")}
                                                    error={!!errors.gender}
                                                    helperText={errors.gender?.message}
                                                    placeholder={t("select_gender")}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Controller
                                            name="isActive"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={value}
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
                                                            color="primary"
                                                        />
                                                    }
                                                    label={Boolean(value) ? t("active") : t("inactive")}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Suspense>
        </Box>
    );
};

export default React.memo(CreateNewCustomer);
