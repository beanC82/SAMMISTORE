import React, { useEffect, useState, useRef } from 'react';
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
    Avatar,
    FormHelperText,
    InputLabel,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTranslation } from 'react-i18next';
import CustomTextField from 'src/components/text-field';
import CustomAutocomplete from 'src/components/custom-autocomplete';
import Spinner from 'src/components/spinner';
import { useDispatch, useSelector } from 'react-redux';
import { createEventAsync, updateEventAsync } from 'src/stores/event/action';
import { useRouter } from 'next/router';
import { AppDispatch, RootState } from 'src/stores';
import { getEventCode, getEventDetail } from 'src/services/event';
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { getAllProvinces } from 'src/services/province';
import { getAllProducts, getProductCode } from 'src/services/product';
import IconifyIcon from 'src/components/Icon';
import FileUploadWrapper from 'src/components/file-upload-wrapper';
import { convertBase64, convertHTMLToDraft } from 'src/utils';
import { TParamsCreateEvent, TParamsUpdateEvent } from 'src/types/event';
import CustomEditor from 'src/components/custom-editor';
import { convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { format, addHours } from 'date-fns';
import { Resolver } from 'react-hook-form';
import { getVoucherCode } from '@/services/voucher';

enum PromotionEventType {
    DirectDiscount = 0,
    OrderBasedPromotion = 1,
    FlashSale = 2,
    SpecialOccasion = 3,
}

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

interface ImageCommand {
    imageUrl: string;
    imageBase64: string;
    publicId: string;
    typeImage: string;
    value: string;
    displayOrder: number;
}

interface VoucherCondition {
    voucherId: number;
    conditionType: number;
    conditionValue: number;
}

interface VoucherCommand {
    id?: number;
    code: string;
    name: string;
    eventId: number;
    discountTypeId: number;
    discountValue: number;
    usageLimit: number;
    startDate: Date;
    endDate: Date;
    conditions: VoucherCondition[];
    isActive: boolean;
}

interface EventImage {
    imageUrl: string;
    imageBase64: string;
    publicId: string;
    typeImage: string;
    value: string;
    displayOrder: number;
}

type EventFormData = {
    code: string;
    name: string;
    startDate: Date;
    endDate: Date;
    eventType: number;
    imageCommand: EventImage;
    imageId: number;
    description: EditorState;
    voucherCommands: VoucherCommand[];
    isActive: boolean;
};

interface VoucherFormErrors {
    code?: { message?: string };
    name?: { message?: string };
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

interface CreateUpdateEventProps {
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

const CreateUpdateEvent: React.FC<CreateUpdateEventProps> = ({ id, onClose }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch: AppDispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const [eventCode, setEventCode] = useState<string>("");
    const [voucherCode, setVoucherCode] = useState<string>("");

    const [voucherCommands, setVoucherCommands] = useState<VoucherCommand[]>([
        {
            id: 0,
            code: '',
            name: '',
            eventId: 0,
            discountTypeId: 0,
            discountValue: 0,
            usageLimit: 0,
            startDate: new Date(),
            endDate: new Date(),
            isActive: true,
            conditions: [
                {
                    voucherId: 0,
                    conditionType: 0,
                    conditionValue: 0
                }
            ]
        }
    ]);

    const [provinces, setProvinces] = useState<{ label: string, value: number }[]>([]);
    const [products, setProducts] = useState<{ label: string, value: number }[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const { errorMessageCreateUpdate } = useSelector((state: RootState) => state.event);

    const eventTypeOptions = [
        { label: t("direct_discount"), value: PromotionEventType.DirectDiscount },
        { label: t("order_based_promotion"), value: PromotionEventType.OrderBasedPromotion },
        { label: t("flash_sale"), value: PromotionEventType.FlashSale },
        { label: t("special_occasion"), value: PromotionEventType.SpecialOccasion },
    ];

    const discountTypeOptions = [
        { label: t("percentage_discount"), value: DiscountTypeEnum.Percentage },
        { label: t("fixed_amount"), value: DiscountTypeEnum.FixedAmount },
        { label: t("free_shipping"), value: DiscountTypeEnum.FreeShipping },
    ];

    const conditionTypeOptions = [
        { label: t("min_order_value"), value: ConditionTypeEnum.MinOrderValue },
        { label: t("max_discount_amount"), value: ConditionTypeEnum.MaxDiscountAmount },
        { label: t("required_quantity"), value: ConditionTypeEnum.RequiredQuantity },
        { label: t("allowed_regions"), value: ConditionTypeEnum.AllowedRegions },
        { label: t("required_products"), value: ConditionTypeEnum.RequiredProducts },
    ];

    const schema = yup.object().shape({
        code: yup.string().required(t("event_code_required")),
        name: yup.string().required(t("event_name_required")),
        startDate: yup.date().required(t("start_date_required")),
        endDate: yup.date().required(t("end_date_required")),
        eventType: yup.number().required(t("event_type_required")),
        imageCommand: yup.object().shape({
            imageUrl: yup.string().default(""),
            imageBase64: yup.string().default(""),
            publicId: yup.string().default(""),
            typeImage: yup.string().default(""),
            value: yup.string().default(""),
            displayOrder: yup.number().default(0)
        }).default({}),
        imageId: yup.number().notRequired(),
        isActive: yup.boolean().default(true),
        description: yup.mixed<EditorState>().notRequired(),
        voucherCommands: yup.array().when('$isEditMode', {
            is: false,
            then: (schema) => schema.of(
                yup.object().shape({
                    code: yup.string().required(t("voucher_code_required")),
                    name: yup.string().required(t("voucher_name_required")),
                    eventId: yup.number(),
                    isActive: yup.boolean().default(true),
                    discountTypeId: yup.number().required(t("discount_type_required")),
                    discountValue: yup.number().required(t("discount_value_required")),
                    usageLimit: yup.number().required(t("usage_limit_required")),
                    startDate: yup.date().required(t("voucher_start_date_required")),
                    endDate: yup.date().required(t("voucher_end_date_required")),
                    conditions: yup.array().of(
                        yup.object().shape({
                            voucherId: yup.number(),
                            conditionType: yup.number().required(t("condition_type_required")),
                            conditionValue: yup.number().required(t("condition_value_required"))
                        })
                    )
                })
            ),
            otherwise: (schema) => schema.notRequired()
        })
    });

    const defaultValues: EventFormData = {
        code: eventCode,
        name: '',
        startDate: new Date(),
        endDate: new Date(),
        eventType: 0,
        isActive: true,
        imageCommand: {
            imageUrl: '',
            imageBase64: '',
            publicId: '',
            typeImage: '',
            value: '',
            displayOrder: 0
        },
        imageId: 0,
        description: EditorState.createEmpty(),
        voucherCommands: [{
            id: 0,
            code: '',
            name: '',
            isActive: true,
            eventId: isEditMode && id ? id : 0,
            discountTypeId: 0,
            discountValue: 0,
            usageLimit: 0,
            startDate: new Date(),
            endDate: new Date(),
            conditions: [{
                voucherId: isEditMode && id ? id : 0,
                conditionType: 0,
                conditionValue: 0
            }]
        }]
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm<EventFormData>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema) as Resolver<EventFormData>,
        context: { isEditMode }
    });

    const watchedVoucherCommands = watch('voucherCommands');

    const handleUploadImage = async (file: File) => {
        const base64WithPrefix = await convertBase64(file);
        const base64 = base64WithPrefix.split(",")[1];
        const imageObject = {
            imageUrl: '',
            imageBase64: base64,
            publicId: "''",
            typeImage: '',
            value: '',
            displayOrder: 0,
        };
        setValue("imageCommand", imageObject, { shouldValidate: true });
        setPreviewImage(base64WithPrefix);
    };

    const handleImageLoad = () => {
        setIsImageLoaded(true);
    };

    const fetchEventDetail = async (eventId: number) => {
        setLoading(true);
        try {
            const res = await getEventDetail(eventId);
            if (res?.result) {
                const data = res.result;
                setValue('code', data.code);
                setValue('isActive', data.isActive);
                setValue('name', data.name);
                setValue('imageId', data.imageId);
                
                // Convert UTC dates to Vietnam timezone (UTC+7)
                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);
                setValue('startDate', addHours(startDate, 0));
                setValue('endDate', addHours(endDate, 0));

                let numericEventType: number = PromotionEventType.DirectDiscount;
                switch (data.eventType) {
                    case "DirectDiscount":
                        numericEventType = PromotionEventType.DirectDiscount;
                        break;
                    case "OrderBasedPromotion":
                        numericEventType = PromotionEventType.OrderBasedPromotion;
                        break;
                    case "FlashSale":
                        numericEventType = PromotionEventType.FlashSale;
                        break;
                    case "SpecialOccasion":
                        numericEventType = PromotionEventType.SpecialOccasion;
                        break;
                    default:
                        console.warn("Unknown event type received from API:", data.eventType);
                }
                setValue('eventType', numericEventType);

                if (data.imageCommand) {
                    const imageCommand = {
                        ...data.imageCommand,
                        typeImage: typeof data.imageCommand.typeImage === 'string' ? data.imageCommand.typeImage : 0
                    };
                    setValue('imageCommand', imageCommand);

                    let imageToPreview = '';
                    if (imageCommand.imageBase64) {
                        imageToPreview = imageCommand.imageBase64.startsWith("data:")
                            ? imageCommand.imageBase64
                            : `data:image/jpeg;base64,${imageCommand.imageBase64}`;
                    } else if (imageCommand.imageUrl) {
                        imageToPreview = imageCommand.imageUrl;
                    }
                    setPreviewImage(imageToPreview);
                } else if (data.imageUrl) {
                    setPreviewImage(data.imageUrl);
                    setValue("imageCommand", {
                        imageUrl: data.imageUrl,
                        imageBase64: '',
                        publicId: '',
                        typeImage: '',
                        value: '',
                        displayOrder: 0,
                    }, { shouldValidate: false });
                }

                setValue('description', data.description ? convertHTMLToDraft(data.description) : EditorState.createEmpty());

                if (data.voucherCommands && data.voucherCommands.length > 0) {
                    const adjustedVouchers = data.voucherCommands.map((voucher: VoucherCommand) => ({
                        ...voucher,
                        isActive: voucher.isActive,
                        // Convert UTC dates to Vietnam timezone (UTC+7)
                        startDate: addHours(new Date(voucher.startDate), -7),
                        endDate: addHours(new Date(voucher.endDate), -7),
                    }));
                    setValue('voucherCommands', adjustedVouchers);
                    setVoucherCommands(adjustedVouchers);
                }
            }
        } catch (err) {
            console.error('Error fetching event detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProvinces = async () => {
        setLoading(true);
        try {
            const res = await getAllProvinces({
                params: { take: -1, skip: 0, filters: '', orderBy: 'createdDate', dir: 'asc', paging: false, keywords: "''" },
            });
            const data = res?.result?.subset;
            if (data) {
                setProvinces(data.map((item: { name: string; id: string }) => ({ label: item.name, value: item.id })));
            }
        } catch (error) {
            console.error('Error fetching provinces:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProducts = async () => {
        setLoading(true);
        try {
            const res = await getAllProducts({
                params: { take: -1, skip: 0, filters: '', orderBy: 'createdDate', dir: 'asc', paging: false, keywords: "''" },
            });
            const data = res?.result?.subset;
            if (data) {
                setProducts(data.map((item: { name: string; id: string }) => ({ label: item.name, value: item.id })));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventDefaultCode = async () => {
        const res = await getEventCode({
            params: { take: -1, skip: 0, filters: '', orderBy: 'createdDate', dir: 'asc', paging: false, keywords: "''" }
        });
        setEventCode(res?.result);
    };

    const getVoucherDefaultCode = async () => {
        const res = await getVoucherCode({
            params: { take: -1, skip: 0, filters: '', orderBy: 'createdDate', dir: 'asc', paging: false, keywords: "''" }
        });
        setVoucherCode(res?.result);
    };

    useEffect(() => {
        fetchAllProvinces();
        fetchAllProducts();
        getEventDefaultCode();
        getVoucherDefaultCode();
    }, []);

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            fetchEventDetail(id);
        } else {
            setIsEditMode(false);
            reset(defaultValues);
        }
    }, [id]);

    console.log("err", errors)

    const onSubmit = async (data: EventFormData) => {
        try {
            const { voucherCommands, ...eventDataWithoutVouchers } = data;

            const adjustedStartDate = addHours(data.startDate, 7);
            const adjustedEndDate = addHours(data.endDate, 7);

            const baseData = {
                ...eventDataWithoutVouchers,
                startDate: adjustedStartDate,
                endDate: adjustedEndDate,
                isActive: data.isActive,
                description: data?.description ? draftToHtml(convertToRaw(data?.description.getCurrentContent())) : "",
                imageId: data.imageId || 0,
            };

            let eventData;
            if (isEditMode && id) {
                eventData = baseData;
            } else {
                eventData = {
                    ...baseData,
                    voucherCommands: data.voucherCommands.map(voucher => ({
                        code: voucher.code,
                        name: voucher.name,
                        eventId: 0,
                        isActive: voucher.isActive || true,
                        discountTypeId: voucher.discountTypeId,
                        discountValue: voucher.discountValue,
                        usageLimit: voucher.usageLimit,
                        startDate: addHours(voucher.startDate, 7),
                        endDate: addHours(voucher.endDate, 7),
                        conditions: voucher.conditions.map(condition => ({
                            voucherId: 0,
                            conditionType: condition.conditionType,
                            conditionValue: condition.conditionValue
                        }))
                    }))
                };
            }

            if (isEditMode && id) {
                const result = await dispatch(updateEventAsync({ ...eventData, id, voucherCommands: [] }));
                if (result?.payload?.isSuccess) {
                    onClose();
                }
            } else {
                const result = await dispatch(createEventAsync({ ...eventData, voucherCommands: data.voucherCommands }));
                if (result?.payload?.isSuccess) {
                    onClose();
                }
            }
        } catch (error: any) {
            console.error('Error submitting event:', error);
        }
    };

    const handleAddVoucher = () => {
        const newVoucher: VoucherCommand = {
            id: voucherCommands.length + 1,
            code: '',
            name: '',
            eventId: 0,
            discountTypeId: 0,
            discountValue: 0,
            usageLimit: 0,
            isActive: true,
            startDate: new Date(),
            endDate: new Date(),
            conditions: [
                {
                    voucherId: voucherCommands.length + 1,
                    conditionType: 0,
                    conditionValue: 0
                }
            ]
        };

        const updatedVouchers = [...voucherCommands, newVoucher];
        setVoucherCommands(updatedVouchers);

        setValue('voucherCommands', updatedVouchers);
    };

    const handleAddCondition = (voucherIndex: number) => {
        const updatedVouchers = [...voucherCommands];
        const voucher = updatedVouchers[voucherIndex];

        const newCondition: VoucherCondition = {
            voucherId: voucher.id || 0,
            conditionType: 0,
            conditionValue: 0
        };

        voucher.conditions = [...voucher.conditions, newCondition];

        setVoucherCommands(updatedVouchers);
        setValue('voucherCommands', updatedVouchers);
    };

    const handleRemoveCondition = (voucherIndex: number, conditionIndex: number) => {
        const updatedVouchers = [...voucherCommands];
        const voucher = updatedVouchers[voucherIndex];

        voucher.conditions = voucher.conditions.filter((_, index) => index !== conditionIndex);

        if (voucher.conditions.length === 0) {
            voucher.conditions = [{
                voucherId: voucher.id || 0,
                conditionType: 0,
                conditionValue: 0
            }];
        }

        setVoucherCommands(updatedVouchers);

        setValue('voucherCommands', updatedVouchers);
    };

    const handleRemoveVoucher = (index: number) => {
        if (voucherCommands.length === 1) {
            const resetVoucher = {
                id: 0,
                code: '',
                name: '',
                eventId: 0,
                discountTypeId: 0,
                discountValue: 0,
                usageLimit: 0,
                isActive: true,
                startDate: new Date(),
                endDate: new Date(),
                conditions: [{
                    voucherId: 0,
                    conditionType: 0,
                    conditionValue: 0
                }]
            };
            setVoucherCommands([resetVoucher]);
            setValue('voucherCommands', [resetVoucher]);
        } else {
            const updatedVouchers = voucherCommands.filter((_, i) => i !== index);
            setVoucherCommands(updatedVouchers);
            setValue('voucherCommands', updatedVouchers);
        }
    };

    const handleVoucherChange = (index: number, field: string, value: any) => {
        const updatedVouchers = [...voucherCommands];
        updatedVouchers[index] = {
            ...updatedVouchers[index],
            [field]: value
        };
        setVoucherCommands(updatedVouchers);
        setValue('voucherCommands', updatedVouchers);
    };

    const handleConditionChange = (voucherIndex: number, conditionIndex: number, field: string, value: any) => {
        const updatedVouchers = [...voucherCommands];
        const voucher = updatedVouchers[voucherIndex];

        const updatedConditions = [...voucher.conditions];
        updatedConditions[conditionIndex] = {
            ...updatedConditions[conditionIndex],
            [field]: value
        };

        updatedVouchers[voucherIndex] = {
            ...voucher,
            conditions: updatedConditions
        };

        setVoucherCommands(updatedVouchers);
        setValue('voucherCommands', updatedVouchers);
    };

    const renderConditionValueField = (voucher: VoucherCommand, condition: any, voucherIndex: number, conditionIndex: number) => {
        const conditionType = condition.conditionType;

        if (conditionType === ConditionTypeEnum.AllowedRegions) {
            return (
                <Box>
                    <CustomAutocomplete
                        options={provinces}
                        value={provinces.find(option => option.value === condition.conditionValue) || null}
                        onChange={(newValue) => {
                            handleConditionChange(voucherIndex, conditionIndex, 'conditionValue', newValue?.value || 0);
                        }}
                        loading={loadingProvinces}
                        error={!!(errors.voucherCommands as VoucherFormErrors)?.conditions?.conditionValue}
                        helperText={(errors.voucherCommands as VoucherFormErrors)?.conditions?.conditionValue?.message}
                        placeholder={t("enter_province")}
                        size="small"
                    />
                </Box>
            );
        } else if (conditionType === ConditionTypeEnum.RequiredProducts) {
            return (
                <Box>
                    <CustomAutocomplete
                        options={products}
                        value={products.find(option => option.value === condition.conditionValue) || null}
                        onChange={(newValue) => {
                            handleConditionChange(voucherIndex, conditionIndex, 'conditionValue', newValue?.value || 0);
                        }}
                        loading={loadingProducts}
                        error={!!(errors.voucherCommands as VoucherFormErrors)?.conditions?.conditionValue}
                        helperText={(errors.voucherCommands as VoucherFormErrors)?.conditions?.conditionValue?.message}
                        placeholder={t("enter_product")}
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
                    value={condition.conditionValue}
                    onChange={(e) => handleConditionChange(voucherIndex, conditionIndex, 'conditionValue', parseFloat(e.target.value) || 0)}
                    error={!!(errors.voucherCommands as VoucherFormErrors)?.conditions?.conditionValue}
                    helperText={(errors.voucherCommands as VoucherFormErrors)?.conditions?.conditionValue?.message}
                    placeholder={t("enter_condition_value")}
                    size="small"
                />
            );
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3 }}>
                {loading && <Spinner />}
                <Paper sx={{ p: 2 }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5">{isEditMode ? t("update_event") : t("create_event")}</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="outlined" onClick={onClose}>
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" variant="contained" color="primary">
                                    {isEditMode ? t("update") : t("create")}
                                </Button>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} mb={3}>
                                <Controller
                                    control={control}
                                    name="imageCommand"
                                    render={({ field: { value } }) => (
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                            <Box sx={{ position: "relative" }}>
                                                {previewImage && (
                                                    <img
                                                        ref={imageRef}
                                                        src={previewImage}
                                                        style={{ display: "none" }}
                                                        onLoad={handleImageLoad}
                                                        onError={() => setIsImageLoaded(false)}
                                                        alt="preload"
                                                    />
                                                )}
                                                {loading || (previewImage && !isImageLoaded) ? (
                                                    <Avatar alt="loading-avatar" sx={{ width: 100, height: 100 }}>
                                                        <IconifyIcon icon="eos-icons:loading" fontSize={70} />
                                                    </Avatar>
                                                ) : previewImage && isImageLoaded ? (
                                                    <Avatar
                                                        src={previewImage}
                                                        sx={{ width: 100, height: 100 }}
                                                        alt="event-image"
                                                    />
                                                ) : (
                                                    <Avatar alt="default-avatar" sx={{ width: 100, height: 100 }}>
                                                        <IconifyIcon icon="carbon:event" fontSize={70} />
                                                    </Avatar>
                                                )}
                                                {previewImage && (
                                                    <IconButton
                                                        sx={{ position: "absolute", bottom: -4, right: -6, color: theme.palette.error.main }}
                                                        onClick={() => {
                                                            setValue("imageCommand", {
                                                                imageUrl: '',
                                                                imageBase64: '',
                                                                publicId: '',
                                                                typeImage: '',
                                                                value: '',
                                                                displayOrder: 0,
                                                            }, { shouldValidate: true });
                                                            setPreviewImage("");
                                                        }}
                                                    >
                                                        <IconifyIcon icon="material-symbols:delete-rounded" />
                                                    </IconButton>
                                                )}
                                            </Box>
                                            <FileUploadWrapper
                                                uploadFile={handleUploadImage}
                                                objectAcceptedFile={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    sx={{ width: "auto", display: "flex", alignItems: "center", gap: 1 }}
                                                >
                                                    <IconifyIcon icon="ph:camera-thin" />
                                                    {t("upload_event_image")}
                                                </Button>
                                            </FileUploadWrapper>
                                            {errors.imageCommand && (
                                                <FormHelperText sx={{ color: theme.palette.error.main }}>
                                                    {errors.imageCommand.message}
                                                </FormHelperText>
                                            )}
                                        </Box>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            fullWidth
                                            required
                                            label={t("event_code")}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={eventCode}
                                            error={!!errors.code}
                                            helperText={errors.code?.message}
                                            disabled={isEditMode}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomTextField
                                            fullWidth
                                            required
                                            label={t("event_name")}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            placeholder={t("enter_event_name")}
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="eventType"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomAutocomplete
                                            options={eventTypeOptions}
                                            value={eventTypeOptions.find(option => option.value === value) || null}
                                            onChange={(newValue) => {
                                                onChange(newValue?.value || 0);
                                            }}
                                            label={t("event_type")}
                                            error={!!errors.eventType}
                                            helperText={errors.eventType?.message}
                                            placeholder={t("select_event_type")}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12}>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomEditor
                                            editorState={field.value}
                                            onEditorStateChange={(state) => field.onChange(state)}
                                            error={!!errors.description}
                                            helperText={errors.description?.message?.toString()}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {!isEditMode && (
                            <>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">{t("list_voucher")}</Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddVoucher}
                                    >
                                        {t("add_voucher")}
                                    </Button>
                                </Box>

                                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                                    <TableContainer sx={{ mt: 2 }}>
                                        <Table size="small" sx={{ minWidth: 1000 }}>
                                            <TableHead>
                                                <TableRow>
                                                    <StyledTableCell width="5%">#</StyledTableCell>
                                                    <StyledTableCell width="13%">{t("voucher_code")}</StyledTableCell>
                                                    <StyledTableCell width="15%">{t("voucher_name")}</StyledTableCell>
                                                    <StyledTableCell width="17%">{t("discount_type")}</StyledTableCell>
                                                    <StyledTableCell width="7%">{t("discount_value")}</StyledTableCell>
                                                    <StyledTableCell width="7%">{t("usage_limit")}</StyledTableCell>
                                                    <StyledTableCell width="12%">{t("start_date")}</StyledTableCell>
                                                    <StyledTableCell width="12%">{t("end_date")}</StyledTableCell>
                                                    <StyledTableCell width="5%">
                                                        <IconButton color="primary" onClick={handleAddVoucher} size="small">
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </StyledTableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {voucherCommands.map((voucher, voucherIndex) => (
                                                    <TableRow key={voucher.id}>
                                                        <StyledTableCell>{voucherIndex + 1}</StyledTableCell>
                                                        <StyledTableCell>
                                                            <CustomTextField
                                                                fullWidth
                                                                required
                                                                value={voucher.code}
                                                                onChange={(e) => handleVoucherChange(voucherIndex, 'code', e.target.value)}
                                                                error={!!(errors.voucherCommands as VoucherFormErrors)?.code}
                                                                helperText={(errors.voucherCommands as VoucherFormErrors)?.code?.message}
                                                                placeholder={voucherCode}
                                                                size="small"
                                                            />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <CustomTextField
                                                                fullWidth
                                                                required
                                                                value={voucher.name}
                                                                onChange={(e) => handleVoucherChange(voucherIndex, 'name', e.target.value)}
                                                                error={!!(errors.voucherCommands as VoucherFormErrors)?.name}
                                                                helperText={(errors.voucherCommands as VoucherFormErrors)?.name?.message}
                                                                placeholder={t("enter_voucher_name")}
                                                                size="small"
                                                            />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Box>
                                                                <CustomAutocomplete
                                                                    options={discountTypeOptions}
                                                                    value={discountTypeOptions.find(option => option.value === voucher.discountTypeId) || null}
                                                                    onChange={(newValue) => {
                                                                        handleVoucherChange(voucherIndex, 'discountTypeId', newValue?.value || 0);
                                                                    }}
                                                                    error={!!(errors.voucherCommands as VoucherFormErrors)?.discountTypeId}
                                                                    helperText={(errors.voucherCommands as VoucherFormErrors)?.discountTypeId?.message}
                                                                    placeholder={t("select_discount_type")}
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <CustomTextField
                                                                fullWidth
                                                                required
                                                                type="number"
                                                                value={voucher.discountValue}
                                                                onChange={(e) => handleVoucherChange(voucherIndex, 'discountValue', parseFloat(e.target.value) || 0)}
                                                                error={!!(errors.voucherCommands as VoucherFormErrors)?.discountValue}
                                                                helperText={(errors.voucherCommands as VoucherFormErrors)?.discountValue?.message}
                                                                placeholder={t("enter_discount_value")}
                                                                size="small"
                                                            />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <CustomTextField
                                                                fullWidth
                                                                required
                                                                type="number"
                                                                value={voucher.usageLimit}
                                                                onChange={(e) => handleVoucherChange(voucherIndex, 'usageLimit', parseInt(e.target.value) || 0)}
                                                                error={!!(errors.voucherCommands as VoucherFormErrors)?.usageLimit}
                                                                helperText={(errors.voucherCommands as VoucherFormErrors)?.usageLimit?.message}
                                                                placeholder={t("enter_usage_limit")}
                                                                size="small"
                                                            />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <DateTimePicker
                                                                value={voucher.startDate}
                                                                onChange={(newValue) => handleVoucherChange(voucherIndex, 'startDate', newValue)}
                                                                slotProps={{
                                                                    textField: {
                                                                        fullWidth: true,
                                                                        size: "small",
                                                                        error: !!(errors.voucherCommands as VoucherFormErrors)?.startDate,
                                                                        helperText: (errors.voucherCommands as VoucherFormErrors)?.startDate?.message,
                                                                    }
                                                                }}
                                                            />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <DateTimePicker
                                                                value={voucher.endDate}
                                                                onChange={(newValue) => handleVoucherChange(voucherIndex, 'endDate', newValue)}
                                                                slotProps={{
                                                                    textField: {
                                                                        fullWidth: true,
                                                                        size: "small",
                                                                        error: !!(errors.voucherCommands as VoucherFormErrors)?.endDate,
                                                                        helperText: (errors.voucherCommands as VoucherFormErrors)?.endDate?.message,
                                                                    }
                                                                }}
                                                            />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleRemoveVoucher(voucherIndex)}
                                                                size="small"
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                        </StyledTableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>

                                {voucherCommands.length > 0 && (
                                    <>
                                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>{t("voucher_conditions")}</Typography>
                                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                                            <TableContainer>
                                                <Table size="small" sx={{ minWidth: 800 }}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <StyledTableCell width="5%">#</StyledTableCell>
                                                            <StyledTableCell width="35%">{t("voucher_name")}</StyledTableCell>
                                                            <StyledTableCell width="20%">{t("condition_type")}</StyledTableCell>
                                                            <StyledTableCell width="30%">{t("condition_value")}</StyledTableCell>
                                                            <StyledTableCell width="10%"></StyledTableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {voucherCommands.map((voucher, voucherIndex) => (
                                                            voucher.conditions.map((condition, conditionIndex) => (
                                                                <TableRow key={`condition-${voucher.id}-${condition.voucherId}`}>
                                                                    {conditionIndex === 0 && (
                                                                        <StyledTableCell rowSpan={voucher.conditions.length}>{voucherIndex + 1}</StyledTableCell>
                                                                    )}
                                                                    {conditionIndex === 0 && (
                                                                        <StyledTableCell rowSpan={voucher.conditions.length}>{voucher.name}</StyledTableCell>
                                                                    )}
                                                                    {conditionIndex !== 0 && <StyledTableCell style={{ display: 'none' }} />}
                                                                    {conditionIndex !== 0 && <StyledTableCell style={{ display: 'none' }} />}
                                                                    <StyledTableCell>
                                                                        <Box>
                                                                            <CustomAutocomplete
                                                                                options={conditionTypeOptions}
                                                                                value={conditionTypeOptions.find(option => option.value === condition.conditionType) || null}
                                                                                onChange={(newValue) => {
                                                                                    handleConditionChange(voucherIndex, conditionIndex, 'conditionType', newValue?.value || 0);
                                                                                }}
                                                                                error={!!(errors.voucherCommands as VoucherFormErrors)?.conditions?.conditionType}
                                                                                helperText={(errors.voucherCommands as VoucherFormErrors)?.conditions?.conditionType?.message}
                                                                                placeholder={t("enter_condition_type")}
                                                                                size="small"
                                                                            />
                                                                        </Box>
                                                                    </StyledTableCell>
                                                                    <StyledTableCell>
                                                                        {renderConditionValueField(voucher, condition, voucherIndex, conditionIndex)}
                                                                    </StyledTableCell>
                                                                    <StyledTableCell>
                                                                        <Box sx={{ display: 'flex' }}>
                                                                            {voucher.conditions.length > 1 && (
                                                                                <IconButton
                                                                                    color="error"
                                                                                    onClick={() => handleRemoveCondition(voucherIndex, conditionIndex)}
                                                                                    size="small"
                                                                                >
                                                                                    <RemoveIcon fontSize="small" />
                                                                                </IconButton>
                                                                            )}
                                                                            {conditionIndex === voucher.conditions.length - 1 && (
                                                                                <IconButton
                                                                                    color="primary"
                                                                                    onClick={() => handleAddCondition(voucherIndex)}
                                                                                    size="small"
                                                                                >
                                                                                    <AddIcon fontSize="small" />
                                                                                </IconButton>
                                                                            )}
                                                                        </Box>
                                                                    </StyledTableCell>
                                                                </TableRow>
                                                            ))
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    </>
                                )}
                            </>
                        )}
                    </form>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default CreateUpdateEvent;
