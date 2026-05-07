import React, { useEffect, useState } from 'react';
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import {
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    styled,
    useTheme,
    TableCell,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    IconButton,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTranslation } from 'react-i18next';
import CustomTextField from 'src/components/text-field';
import CustomAutocomplete, { AutocompleteOption } from 'src/components/custom-autocomplete';
import Spinner from 'src/components/spinner';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'src/stores';
import { getVoucherDetail, getVoucherCode } from 'src/services/voucher';
import { getAllEvents } from 'src/services/event';
import { getAllProvinces } from 'src/services/province';
import { getAllProducts } from 'src/services/product';
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { createVoucherAsync, updateVoucherAsync, getAllVouchersAsync } from 'src/stores/voucher/action';
import { vi } from 'date-fns/locale';
import { addHours } from 'date-fns';

enum DiscountTypeEnum {
    Percentage = 1,
    FixedAmount = 2,
    FreeShipping = 3,
}

enum ConditionTypeEnum {
    MinOrderValue = 0,
    MaxDiscountAmount = 1,
    RequiredQuantity = 2,
    AllowedRegions = 3,
    RequiredProducts = 4,
}

interface VoucherCondition {
    voucherId: number;
    conditionType: number;  
    conditionValue?: string;
    id?: number;
    createdDate?: string;
    updatedDate?: string;
    createdBy?: string;
    updatedBy?: string;
    isActive?: boolean | true;
    isDeleted?: boolean | false;
    displayOrder?: number;
}

interface VoucherFormData {
    code: string;
    name: string;
    eventId: number;
    discountTypeId: number;
    discountValue: number;
    usageLimit: number;
    startDate: Date;
    endDate: Date;
    conditions: VoucherCondition[];
    id?: number;
    createdDate?: string;
    updatedDate?: string;
    createdBy?: string;
    updatedBy?: string;
    isActive?: boolean | true;
    isDeleted?: boolean | false;
    displayOrder?: number;
}

interface VoucherFormErrors {
    code?: { message?: string };
    name?: { message?: string };
    eventId?: { message?: string };
    discountTypeId?: { message?: string };
    discountValue?: { message?: string };
    usageLimit?: { message?: string };
    startDate?: { message?: string };
    endDate?: { message?: string };
    conditions?: {
        conditionType?: { message?: string };
        conditionValue?: { message?: string };
    };
}

interface CreateUpdateVoucherProps {
    id?: number;
    onClose: () => void;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(1),
    '& .MuiTextField-root': {
        margin: 0,
        width: '100%',
    },
}));

const CreateUpdateVoucher: React.FC<CreateUpdateVoucherProps> = ({ id, onClose }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch: AppDispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const voucherCode = useSelector((state: any) => state.voucher.voucherCode);
    const [conditions, setConditions] = useState<VoucherCondition[]>([]);
    const [events, setEvents] = useState<AutocompleteOption[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [provinces, setProvinces] = useState<AutocompleteOption[]>([]);
    const [products, setProducts] = useState<AutocompleteOption[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedConditionTypes, setSelectedConditionTypes] = useState<number[]>([]);

    const discountTypeOptions: AutocompleteOption[] = [
        { label: t("percentage_discount"), value: DiscountTypeEnum.Percentage },
        { label: t("fixed_amount"), value: DiscountTypeEnum.FixedAmount },
        { label: t("free_shipping"), value: DiscountTypeEnum.FreeShipping },
    ];

    const conditionTypeOptions: AutocompleteOption[] = [
        { label: t("min_order_value"), value: ConditionTypeEnum.MinOrderValue },
        { label: t("max_discount_amount"), value: ConditionTypeEnum.MaxDiscountAmount },
        { label: t("required_quantity"), value: ConditionTypeEnum.RequiredQuantity },
        { label: t("allowed_regions"), value: ConditionTypeEnum.AllowedRegions },
        { label: t("required_products"), value: ConditionTypeEnum.RequiredProducts },
    ];

    const schema = yup.object().shape({
        code: yup.string().required(t("code_required")),
        name: yup.string().required(t("name_required")),
        eventId: yup.number().required(t("event_required")),
        discountTypeId: yup.number().required(t("discount_type_required")),
        discountValue: yup.number().required(t("discount_value_required")),
        usageLimit: yup.number().required(t("usage_limit_required")),
        startDate: yup.date().required(t("start_date_required")),
        endDate: yup.date().required(t("end_date_required")),
        conditions: yup.array().of(
            yup.object().shape({
                voucherId: yup.number().default(0),
                conditionType: yup.number().default(ConditionTypeEnum.MinOrderValue),
                conditionValue: yup.string(),
            })
        ).default([]),
    });

    const defaultValues: VoucherFormData = {
        code: "",
        name: "",
        eventId: 0,
        discountTypeId: 0,
        discountValue: 0,
        usageLimit: 0,
        startDate: new Date(),
        endDate: new Date(),
        conditions: [{
            id: 0,
            voucherId: 0,
            conditionType: 0,
            conditionValue: "0",
        }],
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<VoucherFormData>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const fetchAllEvents = async () => {
        setLoadingEvents(true);
        try {
            const res = await getAllEvents({
                params: {
                    take: -1,
                    skip: 0,
                    paging: false,
                    orderBy: "name",
                    dir: "asc",
                    keywords: "''",
                    filters: ""
                }
            });
            if (res?.result?.subset) {
                setEvents(res.result.subset.map((event: any) => ({
                    label: event.name,
                    value: event.id
                })));
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const getConditionTypeFromString = (type: string | number): number => {
        if (typeof type === 'number') return type;
        
        switch (type) {
            case 'MinOrderValue':
                return ConditionTypeEnum.MinOrderValue;
            case 'MaxDiscountAmount':
                return ConditionTypeEnum.MaxDiscountAmount;
            case 'RequiredQuantity':
                return ConditionTypeEnum.RequiredQuantity;
            case 'AllowedRegions':
                return ConditionTypeEnum.AllowedRegions;
            case 'RequiredProducts':
                return ConditionTypeEnum.RequiredProducts;
            default:
                return 0;
        }
    };

    const fetchVoucherDetail = async (voucherId: number) => {
        setLoading(true);
        try {
            const res = await getVoucherDetail(voucherId);
            if (res?.result) {
                const data = res.result;
                setValue('code', data.code);
                setValue('name', data.name);
                setValue('eventId', data.eventId);
                setValue('discountTypeId', data.discountTypeId);
                setValue('discountValue', data.discountValue);
                setValue('usageLimit', data.usageLimit);
                setValue('startDate', addHours(new Date(data.startDate), 0));
                setValue('endDate', addHours(new Date(data.endDate), 0));
                if (data.conditions && data.conditions.length > 0) {
                    const conditions = data.conditions.map((condition: VoucherCondition) => ({
                        id: condition.id,
                        voucherId: condition.voucherId,
                        conditionType: getConditionTypeFromString(condition.conditionType),
                        conditionValue: condition.conditionValue,
                        displayOrder: condition.displayOrder || 0
                    }));
                    setValue('conditions', conditions);
                    setConditions(conditions);
                    const conditionTypes = conditions.map((condition: VoucherCondition) => condition.conditionType);
                    setSelectedConditionTypes(conditionTypes);
                }
                setValue('isActive', data.isActive);
                setValue('isDeleted', data.isDeleted);
                setValue('displayOrder', data.displayOrder);
            }
        } catch (err) {
            console.error('Error fetching voucher detail:', err);
            toast.error(t('error_fetching_voucher_detail'));
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const res = await getAllProvinces({
                params: {
                    take: -1,
                    skip: 0,
                    paging: false,
                    orderBy: "name",
                    dir: "asc",
                    keywords: "''",
                    filters: ""
                }
            });
            if (res?.result?.subset) {
                setProvinces(res.result.subset.map((province: any) => ({
                    label: province.name,
                    value: Number(province.id)
                })));
            }
        } catch (error) {
            console.error('Error fetching provinces:', error);
        } finally {
            setLoadingProvinces(false);
        }
    };

    const fetchAllProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await getAllProducts({
                params: {
                    take: -1,
                    skip: 0,
                    paging: false,
                    orderBy: "name",
                    dir: "asc",
                    keywords: "''",
                    filters: ""
                }
            });
            if (res?.result?.subset) {
                setProducts(res.result.subset.map((product: any) => ({
                    label: product.name,
                    value: Number(product.id)
                })));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        const fetchVoucherCode = async () => {
            try {
                const res = await getVoucherCode({
                    params: {
                        take: -1,
                        skip: 0,
                        paging: false,
                        orderBy: "name",
                        dir: "asc",
                        keywords: "''",
                        filters: ""
                    }
                });
                if (res?.result) {
                    setValue('code', res.result);
                }
            } catch (err) {
                console.error('Error fetching voucher code:', err);
            }
        };

        fetchAllEvents();
        fetchAllProvinces();
        fetchAllProducts();

        if (id) {
            setIsEditMode(true);
            fetchVoucherDetail(id);
        } else {
            setIsEditMode(false);
            reset(defaultValues);
            fetchVoucherCode();
        }
    }, [id]);

    const handleConditionTypeChange = (index: number, value: number) => {
        const updatedConditions = [...conditions];
        const oldType = updatedConditions[index].conditionType;

        // Update selected condition types
        const newSelectedTypes = [...selectedConditionTypes];
        if (oldType !== value) {
            // Remove old type if it was selected
            const oldTypeIndex = newSelectedTypes.indexOf(oldType);
            if (oldTypeIndex !== -1) {
                newSelectedTypes.splice(oldTypeIndex, 1);
            }
            // Add new type
            if (value !== 0) {
                newSelectedTypes.push(value);
            }
        }
        setSelectedConditionTypes(newSelectedTypes);

        // Reset condition value when type changes
        updatedConditions[index] = {
            ...updatedConditions[index],
            conditionType: value,
            conditionValue: ''
        };
        setConditions(updatedConditions);
        setValue('conditions', updatedConditions);
    };

    const getAvailableConditionTypes = () => {
        return conditionTypeOptions.filter(option => {
            const optionValue = Number(option.value);
            return optionValue === 0 || !selectedConditionTypes.includes(optionValue);
        });
    };

    const handleConditionValueChange = (index: number, value: string | string[]) => {
        const updatedConditions = [...conditions];
        updatedConditions[index] = {
            ...updatedConditions[index],
            conditionValue: Array.isArray(value) ? value.join(',') : String(value)
        };
        setConditions(updatedConditions);
        setValue('conditions', updatedConditions);
    };

    const renderConditionValueField = (condition: VoucherCondition, index: number) => {
        const conditionType = Number(condition.conditionType);

        if (conditionType === ConditionTypeEnum.AllowedRegions) {
            const selectedProvince = condition.conditionValue ?
                provinces.find(province =>
                    province.value.toString() === condition.conditionValue
                ) : null;

            return (
                <Box>
                    <CustomAutocomplete
                        options={provinces}
                        value={selectedProvince || null}
                        onChange={(value: AutocompleteOption | null) => {
                            if (value) {
                                handleConditionValueChange(index, String(value.value));
                            } else {
                                handleConditionValueChange(index, '');
                            }
                        }}
                        loading={loadingProvinces}
                        error={!!(errors.conditions as VoucherFormErrors)?.conditions?.conditionValue}
                        helperText={(errors.conditions as VoucherFormErrors)?.conditions?.conditionValue?.message}
                        placeholder={t("select_provinces")}
                        size="small"
                    />
                </Box>
            );
        } else if (conditionType === ConditionTypeEnum.RequiredProducts) {
            const selectedProduct = condition.conditionValue ?
                products.find(product =>
                    product.value.toString() === condition.conditionValue
                ) : null;

            return (
                <Box>
                    <CustomAutocomplete
                        options={products}
                        value={selectedProduct || null}
                        onChange={(value: AutocompleteOption | null) => {
                            if (value) {
                                handleConditionValueChange(index, String(value.value));
                            } else {
                                handleConditionValueChange(index, '');
                            }
                        }}
                        loading={loadingProducts}
                        error={!!(errors.conditions as VoucherFormErrors)?.conditions?.conditionValue}
                        helperText={(errors.conditions as VoucherFormErrors)?.conditions?.conditionValue?.message}
                        placeholder={t("select_product")}
                        size="small"
                    />
                </Box>
            );
        } else {
            return (
                <CustomTextField
                    fullWidth
                    required
                    type="number"
                    value={condition.conditionValue || 0}
                    onChange={(e) => handleConditionValueChange(index, e.target.value)}
                    error={!!(errors.conditions as VoucherFormErrors)?.conditions?.conditionValue}
                    helperText={(errors.conditions as VoucherFormErrors)?.conditions?.conditionValue?.message}
                    placeholder={t("enter_condition_value")}
                    size="small"
                />
            );
        }
    };

    const handleAddCondition = () => {
        const newCondition: VoucherCondition = {
            id: 0,
            voucherId: 0,
            conditionType: 0,
            conditionValue: "0",
            displayOrder: conditions.length
        };

        const updatedConditions = [...conditions, newCondition];
        setConditions(updatedConditions);
        setValue('conditions', updatedConditions);
    };

    const handleRemoveCondition = (index: number) => {
        const removedCondition = conditions[index];
        const updatedConditions = conditions.filter((_, i) => i !== index);

        // Update selected condition types
        const newSelectedTypes = selectedConditionTypes.filter(type => type !== removedCondition.conditionType);
        setSelectedConditionTypes(newSelectedTypes);

        if (updatedConditions.length === 0) {

            setConditions([]);
            setValue('conditions', []);
        } else {
            setConditions(updatedConditions);
            setValue('conditions', updatedConditions);
        }
    };

    const onSubmit = async (data: VoucherFormData) => {
        try {
            const adjustedStartDate = addHours(data.startDate, 7);
            const adjustedEndDate = addHours(data.endDate, 7);

            if (id) {
                const result = await dispatch(updateVoucherAsync({
                    id,
                    name: data.name,
                    code: data.code,
                    eventId: data.eventId,
                    discountTypeId: data.discountTypeId,
                    discountValue: data.discountValue,
                    usageLimit: data.usageLimit,
                    startDate: adjustedStartDate,
                    endDate: adjustedEndDate,
                    isActive: true,
                    isDeleted: false,
                    conditions: data?.conditions?.map(condition => ({
                        id: condition.id,
                        voucherId: id,
                        conditionType: condition.conditionType,
                        conditionValue: String(condition.conditionValue),
                    })) || [],
                })).unwrap();
                
                if (result?.isSuccess) {
                    toast.success(t('update_voucher_success'));
                    await dispatch(getAllVouchersAsync({
                        params: {
                            take: -1,
                            skip: 0,
                            paging: false,
                            orderBy: "name",
                            dir: "asc",
                            keywords: "''",
                            filters: ""
                        }
                    }));
                    onClose();
                } else {
                    toast.error(result?.message || t('error_saving_voucher'));
                }
            } else {
                const result = await dispatch(createVoucherAsync({
                    name: data.name,
                    code: data.code,
                    eventId: data.eventId,
                    discountTypeId: data.discountTypeId,
                    discountValue: data.discountValue,
                    usageLimit: data.usageLimit,
                    startDate: adjustedStartDate,
                    endDate: adjustedEndDate,
                    isActive: true,
                    isDeleted: false,
                    conditions: data?.conditions?.map(condition => ({
                        voucherId: 0,
                        conditionType: condition.conditionType,
                        conditionValue: String(condition.conditionValue),
                    })) || [],
                })).unwrap();

                if (result?.isSuccess) {
                    toast.success(t('create_voucher_success'));
                    await dispatch(getAllVouchersAsync({
                        params: {
                            take: -1,
                            skip: 0,
                            paging: false,
                            orderBy: "name",
                            dir: "asc",
                            keywords: "''",
                            filters: ""
                        }
                    }));
                    onClose();
                } else {
                    toast.error(result?.message || t('error_saving_voucher'));
                }
            }
        } catch (error: any) {
            console.error("Error submitting form:", error);
            toast.error(error?.message || t('error_saving_voucher'));
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
            <Box sx={{ p: 3 }}>
                {loading && <Spinner />}
                <Paper sx={{ p: 2 }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5">{isEditMode ? t("update_voucher") : t("create_voucher")}</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="outlined" onClick={onClose}>
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" variant="contained" color="primary">
                                    {isEditMode ? t("update") : t("create")}
                                </Button>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            fullWidth
                                            required
                                            label={t("voucher_code")}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t("enter_voucher_code")}
                                            error={!!errors.code}
                                            helperText={errors.code?.message}
                                            disabled={isEditMode}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            fullWidth
                                            required
                                            label={t("voucher_name")}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t("enter_voucher_name")}
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="eventId"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomAutocomplete
                                            options={events}
                                            value={events.find(option => option.value === value) || null}
                                            onChange={(newValue) => {
                                                onChange(newValue?.value || 0);
                                            }}
                                            label={t("event")}
                                            error={!!errors.eventId}
                                            helperText={errors.eventId?.message}
                                            placeholder={t("select_event")}
                                            loading={loadingEvents}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="discountTypeId"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomAutocomplete
                                            options={discountTypeOptions}
                                            value={discountTypeOptions.find(option => option.value === value) || null}
                                            onChange={(newValue) => {
                                                onChange(newValue?.value || 0);
                                            }}
                                            label={t("discount_type")}
                                            error={!!errors.discountTypeId}
                                            helperText={errors.discountTypeId?.message}
                                            placeholder={t("select_discount_type")}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="discountValue"
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            fullWidth
                                            required
                                            type="number"
                                            label={t("discount_value")}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t("enter_discount_value")}
                                            error={!!errors.discountValue}
                                            helperText={errors.discountValue?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="usageLimit"
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            fullWidth
                                            required
                                            type="number"
                                            label={t("usage_limit")}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t("enter_usage_limit")}
                                            error={!!errors.usageLimit}
                                            helperText={errors.usageLimit?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <DateTimePicker
                                            value={value}
                                            onChange={(newValue) => onChange(newValue)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    label: t("start_date"),
                                                    placeholder: t("select_start_date"),
                                                    error: !!errors.startDate,
                                                    helperText: errors.startDate?.message,
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <DateTimePicker
                                            value={value}
                                            onChange={(newValue) => onChange(newValue)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    label: t("end_date"),
                                                    placeholder: t("select_end_date"),
                                                    error: !!errors.endDate,
                                                    helperText: errors.endDate?.message,
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{t("voucher_conditions")}</Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddCondition}
                            >
                                {t("add_condition")}
                            </Button>
                        </Box>

                        {
                            conditions.length > 0 && (
                                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                                    <TableContainer sx={{ mt: 2 }}>
                                        <Table size="small" sx={{ minWidth: 800 }}>
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell width="5%">#</StyledTableCell>
                                            <StyledTableCell width="35%">{t("condition_type")}</StyledTableCell>
                                            <StyledTableCell width="50%">{t("condition_value")}</StyledTableCell>
                                            <StyledTableCell width="10%"></StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {conditions.map((condition, index) => (
                                            <TableRow key={index}>
                                                <StyledTableCell>{index + 1}</StyledTableCell>
                                                <StyledTableCell>
                                                    <Box>
                                                        <CustomAutocomplete
                                                            options={getAvailableConditionTypes()}
                                                            value={conditionTypeOptions.find(option => Number(option.value) === Number(condition.conditionType)) || null}
                                                            onChange={(value: AutocompleteOption | null) => {
                                                                if (value) {
                                                                    handleConditionTypeChange(index, Number(value.value));
                                                                } else {
                                                                    handleConditionTypeChange(index, 0);
                                                                }
                                                            }}
                                                            error={!!(errors.conditions as VoucherFormErrors)?.conditions?.conditionType}
                                                            helperText={(errors.conditions as VoucherFormErrors)?.conditions?.conditionType?.message}
                                                            placeholder={t("select_condition_type")}
                                                            size="small"
                                                        />
                                                    </Box>
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    {renderConditionValueField(condition, index)}
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    <Box sx={{ display: 'flex' }}>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleRemoveCondition(index)}
                                                                size="small"
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                
                                                        {index === conditions.length - 1 && (
                                                            <IconButton
                                                                color="primary"
                                                                onClick={handleAddCondition}
                                                                size="small"
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </StyledTableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                            )
                        }
                    </form>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default CreateUpdateVoucher;
