import React from 'react';
import { Autocomplete as MuiAutocomplete, TextField, Box, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface AutocompleteOption {
    label: string;
    value: string | number;
    id?: number;
    price?: number;
    [key: string]: any;
}

interface CustomAutocompleteProps {
    options: AutocompleteOption[];
    value: AutocompleteOption | null;
    onChange: (value: AutocompleteOption | null) => void;
    label?: string;
    placeholder?: string;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    fullWidth?: boolean;
    size?: 'small' | 'medium';
    disabled?: boolean;
    loading?: boolean;
    noOptionsText?: string;
    loadingText?: string;
    openText?: string;
    closeText?: string;
    clearText?: string;
    renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: AutocompleteOption) => React.ReactNode;
    filterOptions?: (options: AutocompleteOption[], { inputValue }: { inputValue: string }) => AutocompleteOption[];
    isOptionEqualToValue?: (option: AutocompleteOption, value: AutocompleteOption) => boolean;
    getOptionLabel?: (option: AutocompleteOption) => string;
    [key: string]: any; // Allow for additional props
}

// Define the styled component
const StyledAutocomplete = styled(MuiAutocomplete)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.grey[500],
        },
        '&:hover fieldset': {
            borderColor: theme.palette.grey[700],
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-error fieldset': {
            // border: `1px solid ${theme.palette.error.main}`,
            borderColor: `${theme.palette.error.main} !important`,
        },
        
        "& .MuiFormHelperText-root": {
            lineHeight: 1.154,
            margin: theme.spacing(1, 0, 0),
            color: theme.palette.error.main,
            fontSize: theme.typography.body2.fontSize,
            whiteSpace: "normal",
            wordWrap: "break-word",
            textWrap: "wrap",
            "& .Mui-error": {
                color: theme.palette.error.main
            }
        },
    },
}));

const CustomAutocomplete: React.FC<CustomAutocompleteProps> = ({
    options,
    value,
    onChange,
    label,
    placeholder,
    error,
    helperText,
    required,
    fullWidth = true,
    size = 'small',
    disabled = false,
    loading = false,
    noOptionsText,
    loadingText,
    openText,
    closeText,
    clearText,
    renderOption,
    filterOptions,
    isOptionEqualToValue,
    getOptionLabel,
    ...rest
}) => {
    const { t } = useTranslation();

    // Default render option function if not provided
    const defaultRenderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: AutocompleteOption) => (
        <li {...props} key={`${option.value}-${option.label}`}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{option.label}</Typography>
                {option.id && (
                    <Typography variant="caption" color="text.secondary">
                        {t("id")}: {option.id}
                    </Typography>
                )}
            </Box>
        </li>
    );

    // Default filter options function if not provided
    const defaultFilterOptions = (options: AutocompleteOption[], { inputValue }: { inputValue: string }) => {
        return options.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    // Default isOptionEqualToValue function if not provided
    const defaultIsOptionEqualToValue = (option: AutocompleteOption, value: AutocompleteOption) => {
        return option.value === value.value;
    };

    // Default getOptionLabel function if not provided
    const defaultGetOptionLabel = (option: AutocompleteOption) => {
        return option.label || '';
    };

    // Type assertions for the MUI Autocomplete component
    const typedGetOptionLabel = (getOptionLabel || defaultGetOptionLabel) as any;
    const typedIsOptionEqualToValue = (isOptionEqualToValue || defaultIsOptionEqualToValue) as any;
    const typedFilterOptions = (filterOptions || defaultFilterOptions) as any;
    const typedRenderOption = (renderOption || defaultRenderOption) as any;

    return (
        <StyledAutocomplete
            fullWidth={fullWidth}
            size={size}
            options={options}
            value={value}
            onChange={(_, newValue) => onChange(newValue as AutocompleteOption | null)}
            getOptionLabel={typedGetOptionLabel}
            isOptionEqualToValue={typedIsOptionEqualToValue}
            filterOptions={typedFilterOptions}
            renderOption={typedRenderOption}
            noOptionsText={noOptionsText || t("no_options")}
            loadingText={loadingText || t("loading")}
            openText={openText || t("open")}
            closeText={closeText || t("close")}
            clearText={clearText || t("clear")}
            loading={loading}
            disabled={disabled}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={error}
                    helperText={helperText}
                    placeholder={placeholder}
                    required={required}
                />
            )}
            {...rest}
        />
    );
};

export default CustomAutocomplete; 