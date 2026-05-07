import { Fragment, useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { Box, Button, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, Typography, RadioGroup, Radio, Stack, Checkbox, Chip } from "@mui/material";
import { useTheme } from "@mui/material";
import CustomModal from "src/components/custom-modal";
import IconifyIcon from "src/components/Icon";
import Spinner from "src/components/spinner";
import CustomTextField from "src/components/text-field";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "src/stores";
import NoData from "src/components/no-data";
import { toast } from 'react-toastify';
import { resetInitialState } from "src/stores/address";
import { createAddressAsync, getAllAddressesAsync, updateAddressAsync, deleteAddressAsync } from "src/stores/address/action";
import CustomAutocomplete from "src/components/custom-autocomplete";
import { getAllProvinces } from "src/services/province";
import { getAllDistricts } from "src/services/district";
import { getAllWards } from "src/services/ward";
import { useAuth } from "src/hooks/useAuth";


interface TAddressModal {
    open: boolean;
    onClose: () => void;
}

interface TDefaultValues {
    streetAddress: string;
    wardName: string;
    districtName: string;
    provinceName: string;
    wardId: number;
    isDefault: boolean;
    isActive: boolean;
    isDelete: boolean;
    customerId: number;
}

interface Address {
    id: number;
    streetAddress: string;
    wardId: number;
    customerId: number;
    wardName: string;
    districtName: string;
    provinceName: string;
    isDefault: boolean;
    isActive: boolean;
    isDelete: boolean;
}

interface AutocompleteOption {
    label: string;
    value: string | number;
}

const AddressModal = (props: TAddressModal) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
    const [isEdit, setIsEdit] = useState({ isEdit: false, index: 0 });
    const [wardOptions, setWardOptions] = useState<AutocompleteOption[]>([]);
    const [provinceOptions, setProvinceOptions] = useState<AutocompleteOption[]>([]);
    const [districtOptions, setDistrictOptions] = useState<AutocompleteOption[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<AutocompleteOption | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<AutocompleteOption | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const { user } = useAuth();
    const { open, onClose } = props;
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch: AppDispatch = useDispatch();
    const {
        isLoading,
        isSuccessCreate,
        isErrorCreate,
        errorMessageCreate,
        isSuccessUpdate,
        isErrorUpdate,
        errorMessageUpdate,
        isSuccessDelete,
        isErrorDelete,
        errorMessageDelete
    } = useSelector((state: RootState) => state.address);

    const schema = yup.object().shape({
        streetAddress: yup.string().required(t("required_street_address")),
        wardId: yup.number().required(t("required_ward_id")),
        provinceName: yup.string().required(t("required_province_name")),
        districtName: yup.string().required(t("required_district_name")),
        wardName: yup.string().required(t("required_ward_name")),
        isActive: yup.boolean().default(true),
        isDelete: yup.boolean().default(false),
        isDefault: yup.boolean().default(false),
        customerId: yup.number().required(t("required_customer_id")),
    });

    const defaultValues: TDefaultValues = useMemo(() => ({
        streetAddress: '',
        wardId: 0,
        wardName: '',
        districtName: '',
        provinceName: '',
        isActive: true,
        isDelete: false,
        isDefault: false,
        customerId: user?.id || 0,
    }), [user?.id]);

    const { handleSubmit, control, formState: { errors }, reset, setValue } = useForm<TDefaultValues>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const fetchAllProvinces = async () => {
        try {
            setLoading(true);
            const res = await getAllProvinces({
                params: { take: -1, skip: 0, paging: false, orderBy: "name", dir: "asc", keywords: "''", filters: "" },
            });
            const data = res?.result?.subset;
            if (data) {
                setProvinceOptions(data.map((item: { name: string; id: string }) => ({
                    label: item.name,
                    value: item.id,
                })));
            }
        } catch (error) {
            toast.error(t('error_fetching_provinces'));
        } finally {
            setLoading(false);
        }
    };

    const fetchDistrictsByProvince = async (provinceId: string) => {
        try {
            setLoading(true);
            const res = await getAllDistricts({
                params: { take: -1, skip: 0, paging: false, orderBy: "name", dir: "asc", keywords: "''", filters: `provinceId::${provinceId}::eq` },
            });
            const data = res?.result?.subset;
            if (data) {
                setDistrictOptions(data.map((item: { name: string; id: string }) => ({
                    label: item.name,
                    value: item.id,
                })));
            }
        } catch (error) {
            toast.error(t('error_fetching_districts'));
        } finally {
            setLoading(false);
        }
    };

    const fetchWardsByDistrict = async (districtId: string) => {
        try {
            setLoading(true);
            const res = await getAllWards({
                params: { take: -1, skip: 0, paging: false, orderBy: "name", dir: "asc", keywords: "''", filters: `districtId::${districtId}::eq` },
            });
            const data = res?.result?.subset;
            if (data) {
                setWardOptions(data.map((item: { name: string; id: string }) => ({
                    label: item.name,
                    value: item.id,
                })));
            }
        } catch (error) {
            toast.error(t('error_fetching_wards'));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDefaultAddress = async () => {
        if (selectedAddressId === null) return;

        const currentDefaultAddress = addresses.find(addr => addr.isDefault);
        if (currentDefaultAddress?.id === selectedAddressId) {
            onClose();
            return;
        }

        const addressToUpdate = addresses.find(addr => addr.id === selectedAddressId);
        if (!addressToUpdate) return;

        try {
            await dispatch(updateAddressAsync({
                ...addressToUpdate,
                isDefault: true
            })).unwrap();

            setAddresses(prev => prev.map(addr => ({
                ...addr,
                isDefault: addr.id === selectedAddressId
            })));
            onClose();
        } catch (error) {
            toast.error(t('error_updating_default_address'));
        }
    };

    const handleDeleteAddress = async (addressId: number) => {
        try {
            await dispatch(deleteAddressAsync(addressId)).unwrap();
            await refreshAddresses();
        } catch (error) {
        }
    };

    const onSubmit = async (data: TDefaultValues) => {
        try {
            const payload = {
                streetAddress: data.streetAddress,
                wardId: data.wardId,
                customerId: user?.id || 0,
                isDefault: data.isDefault,
                isActive: true,
                isDelete: false
            };

            if (isEdit.isEdit) {
                const address = addresses[isEdit.index];
                await dispatch(updateAddressAsync({
                    ...payload,
                    id: address.id
                })).unwrap();
            } else {
                await dispatch(createAddressAsync({
                    ...payload,
                    id: 0
                })).unwrap();
            }

            await refreshAddresses();
            resetForm();
        } catch (error) {
            toast.error(t('error_submitting_address'));
        }
    };

    const refreshAddresses = async () => {
        const response = await dispatch(getAllAddressesAsync()).unwrap();
        if (response.result) {
            setAddresses(response.result);
            const defaultAddr = response.result.find((addr: Address) => addr.isDefault);
            setSelectedAddressId(defaultAddr?.id || null);
        }
    };

    const resetForm = () => {
        setIsEdit({ isEdit: false, index: 0 });
        setActiveTab(1);
        reset(defaultValues);
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setWardOptions([]);
    };

    useEffect(() => {
        if (open) {
            refreshAddresses();
            fetchAllProvinces();
        } else {
            resetForm();
            setProvinceOptions([]);
            setDistrictOptions([]);
            setWardOptions([]);
            setSelectedAddressId(null);
        }
    }, [open]);

    useEffect(() => {
        if (selectedProvince) {
            fetchDistrictsByProvince(selectedProvince.value.toString());
            setDistrictOptions([]);
            setWardOptions([]);
            setSelectedDistrict(null);
            setValue("wardId", 0);
            setValue("wardName", "");
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            fetchWardsByDistrict(selectedDistrict.value.toString());
            setWardOptions([]);
            setValue("wardId", 0);
            setValue("wardName", "");
        }
    }, [selectedDistrict]);

    useEffect(() => {
        if (activeTab === 2 && isEdit.isEdit && addresses[isEdit.index]) {
            const address = addresses[isEdit.index];
            setValue('provinceName', address.provinceName);
            setValue('districtName', address.districtName);
            setValue('wardName', address.wardName);
            setValue('streetAddress', address.streetAddress);
            setValue('wardId', address.wardId);
            setValue('isDefault', address.isDefault);

            const province = provinceOptions.find(opt => opt.label === address.provinceName);
            if (province) {
                setSelectedProvince(province);
                fetchDistrictsByProvince(province.value.toString()).then(() => {
                    const district = districtOptions.find(opt => opt.label === address.districtName);
                    if (district) {
                        setSelectedDistrict(district);
                        fetchWardsByDistrict(district.value.toString());
                    }
                });
            }
        }
    }, [activeTab, isEdit, addresses]);

    useEffect(() => {
        if (isSuccessCreate) {
            toast.success(t("create_address_success"));
            refreshAddresses();
            dispatch(resetInitialState());
        } else if (isErrorCreate && errorMessageCreate) {
            toast.error(errorMessageCreate);
            dispatch(resetInitialState());
        }
    }, [isSuccessCreate, isErrorCreate, errorMessageCreate]);

    useEffect(() => {
        if (isSuccessUpdate) {
            toast.success(t("update_address_success"));
            refreshAddresses();
            dispatch(resetInitialState());
        } else if (isErrorUpdate && errorMessageUpdate) {
            toast.error(errorMessageUpdate);
            dispatch(resetInitialState());
        }
    }, [isSuccessUpdate, isErrorUpdate, errorMessageUpdate]);

    useEffect(() => {
        if (isSuccessDelete) {
            toast.success(t("delete_address_success"));
            refreshAddresses();
            dispatch(resetInitialState());
        } else if (isErrorDelete && errorMessageDelete) {
            toast.error(errorMessageDelete);
            dispatch(resetInitialState());
        }
    }, [isSuccessDelete, isErrorDelete, errorMessageDelete]);

    return (
        <>
            {(isLoading || loading) && <Spinner />}
            <CustomModal open={open} onClose={onClose}>
                <Box sx={{
                    backgroundColor: theme.palette.customColors.bodyBg,
                    padding: '20px',
                    borderRadius: '15px',
                    width: { md: '800px', xs: '80vw' },
                    maxWidth: { md: '800px', xs: '80vw' },
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        paddingBottom: '20px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {activeTab === 1 ? t('shipping_address') : (isEdit.isEdit ? t('update_address') : t('add_address'))}
                        </Typography>
                        <IconButton sx={{ position: 'absolute', right: "-10px", top: "-6px" }} onClick={onClose}>
                            <IconifyIcon icon="material-symbols-light:close-rounded" fontSize={"30px"} />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate>
                        <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: "15px", py: 5, px: 4 }}>
                            {activeTab === 1 ? (
                                <Stack direction="column">
                                    {addresses.length > 0 ? (
                                        <FormControl>
                                            <FormLabel sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                                                {t("address")}
                                            </FormLabel>
                                            <RadioGroup
                                                sx={{ gap: 4 }}
                                                value={selectedAddressId || ''}
                                                onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                                            >
                                                {addresses.map((address) => (
                                                    <Box
                                                        key={address.id}
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 2,
                                                            justifyContent: "space-between",
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value={address.id}
                                                            control={<Radio />}
                                                            label={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '100%' }}>
                                                                    <Typography>
                                                                        {`${address.streetAddress}, ${address.wardName}, ${address.districtName}, ${address.provinceName}`}
                                                                    </Typography>
                                                                    {address.isDefault && (
                                                                        <Chip
                                                                            label={t("default")}
                                                                            color="primary"
                                                                            size="small"
                                                                            sx={{ ml: 1 }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            }
                                                            sx={{ flexGrow: 1, m: 0 }}
                                                        />
                                                        <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => {
                                                                    setActiveTab(2);
                                                                    setIsEdit({ isEdit: true, index: addresses.findIndex(addr => addr.id === address.id) });
                                                                }}
                                                                sx={{ py: 1.5 }}
                                                            >
                                                                {t('update')}
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() => handleDeleteAddress(address.id)}
                                                                sx={{ py: 1.5 }}
                                                                disabled={addresses.length === 1 || address.isDefault}
                                                            >
                                                                {t('delete')}
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    ) : (
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                            <NoData imageWidth="60px" imageHeight="60px" textNodata={t("no_shipping_address")} />
                                        </Box>
                                    )}
                                    <Button
                                        variant="outlined"
                                        disabled={addresses.length >= 3}
                                        onClick={() => {
                                            setActiveTab(2);
                                            setIsEdit({ isEdit: false, index: 0 });
                                        }}
                                        sx={{ mt: 3, mb: 2, py: 1.5, width: "fit-content" }}
                                    >
                                        {t('add_address')}
                                    </Button>
                                </Stack>
                            ) : (
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="provinceName"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <CustomAutocomplete
                                                    options={provinceOptions}
                                                    value={provinceOptions.find(option => option.label === value) || null}
                                                    onChange={(newValue) => {
                                                        onChange(newValue?.label || '');
                                                        setSelectedProvince(newValue);
                                                    }}
                                                    label={t("province")}
                                                    error={!!errors.provinceName}
                                                    helperText={errors.provinceName?.message}
                                                    placeholder={t("select_province_name")}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="districtName"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <CustomAutocomplete
                                                    options={districtOptions}
                                                    value={districtOptions.find(option => option.label === value) || null}
                                                    onChange={(newValue) => {
                                                        onChange(newValue?.label || '');
                                                        setSelectedDistrict(newValue);
                                                    }}
                                                    label={t("district")}
                                                    error={!!errors.districtName}
                                                    helperText={errors.districtName?.message}
                                                    placeholder={t("select_district_name")}
                                                    disabled={!selectedProvince}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            control={control}
                                            name="wardId"
                                            render={({ field: { onChange, value } }) => (
                                                <CustomAutocomplete
                                                    options={wardOptions}
                                                    value={wardOptions.find(option => option.value === value) || null}
                                                    onChange={(newValue) => {
                                                        onChange(newValue?.value || 0);
                                                        setValue("wardName", newValue?.label || "");
                                                    }}
                                                    label={t("ward")}
                                                    error={!!errors.wardName}
                                                    helperText={errors.wardName?.message}
                                                    placeholder={t("select_ward_name")}
                                                    disabled={!selectedDistrict}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            control={control}
                                            name="streetAddress"
                                            render={({ field }) => (
                                                <CustomTextField
                                                    fullWidth
                                                    label={t("street_address")}
                                                    {...field}
                                                    placeholder={t("enter_street_address")}
                                                    error={!!errors.streetAddress}
                                                    helperText={errors.streetAddress?.message}
                                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Controller
                                            control={control}
                                            name="isDefault"
                                            render={({ field: { onChange, value } }) => (
                                                <FormControlLabel
                                                    control={<Checkbox checked={value} onChange={onChange} />}
                                                    label={t("set_as_default_address")}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                            {activeTab === 2 && (
                                <Button
                                    variant="outlined"
                                    onClick={resetForm}
                                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                                >
                                    {t('cancel')}
                                </Button>
                            )}
                            <Button
                                type={activeTab === 2 ? "submit" : "button"}
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                                onClick={() => activeTab === 1 && handleConfirmDefaultAddress()}
                            >
                                {activeTab === 2 ? (isEdit.isEdit ? t('save') : t('add')) : t('confirm')}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </CustomModal>
        </>
    );
};

export default AddressModal;