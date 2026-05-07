import React, { useState } from "react";
import {
    Box,
    IconButton,
    Popover,
    Select,
    MenuItem,
    TextField,
    Button,
    Typography,
    Divider,
    SelectChangeEvent,
    useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import IconifyIcon from "../Icon";

type TFilter = {
    field: string;
    operator: string;
    value: string;
    logic?: string;
};

type Operator = {
    value: string;
    label: string;
};

type FieldConfig = {
    value: string;
    label: string;
    type: "string" | "number" | "boolean" | "date";
    operators: Operator[];
};

interface AdminFilterProps {
    fields: FieldConfig[];
    onFilterChange: (filters: TFilter[]) => void;
}

const AdminFilter: React.FC<AdminFilterProps> = ({ fields, onFilterChange }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [filters, setFilters] = useState<TFilter[]>([
        { field: fields[0]?.value || "name", operator: fields[0]?.operators[0]?.value || "contains", value: "", logic: "AND" },
    ]);

    const { t } = useTranslation();
    const theme = useTheme();

    const handleFilterIconClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAddFilter = () => {
        const newFilters = [...filters, { field: fields[0]?.value || "name", operator: fields[0]?.operators[0]?.value || "contains", value: "", logic: "AND" }];
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleRemoveFilter = (index: number) => {
        let newFilters = filters.filter((_, i) => i !== index);
        if (newFilters.length === 0) {
            newFilters = [{ field: fields[0]?.value || "name", operator: fields[0]?.operators[0]?.value || "contains", value: "", logic: "AND" }];
            setFilters(newFilters);
            onFilterChange(newFilters);
            handleClose();
        } else {
            setFilters(newFilters);
            onFilterChange(newFilters);
        }
    };

    const handleRemoveAllFilters = () => {
        const newFilters = [{ field: fields[0]?.value || "name", operator: fields[0]?.operators[0]?.value || "contains", value: "", logic: "AND" }];
        setFilters(newFilters);
        onFilterChange(newFilters);
        handleClose();
    };

    const handleFilterChange = (index: number, key: keyof TFilter, value: string) => {
        const newFilters = [...filters];
        if (key === "logic") {
            newFilters[index] = { ...newFilters[index], [key]: value as "AND" | "OR" };
        } else {
            newFilters[index] = { ...newFilters[index], [key]: value };
        }

        if (key === "field") {
            const newField = fields.find((f) => f.value === value);
            newFilters[index].operator = newField?.operators[0]?.value || "contains";
        }

        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const open = Boolean(anchorEl);

    return (
        <Box
            sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) => theme.palette.grey[100],
            }}
        >
            <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton title={t("filter")} onClick={handleFilterIconClick}>
                    <IconifyIcon icon='cuida:filter-outline' color={theme.palette.primary.main} />
                    <Typography component='span' color={theme.palette.primary.main} sx={{ textTransform: 'uppercase' }}>
                        {t('filters')}
                    </Typography>
                </IconButton>
            </Box>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
            >
                <Box sx={{ p: 4, width: 700 }}>
                    {filters.map((filter, index) => {
                        const selectedField = fields.find((f) => f.value === filter.field);
                        const availableOperators = selectedField?.operators || [];

                        return (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    mb: 1,
                                    alignItems: "center",
                                    flexWrap: "nowrap",
                                    "& > *": {
                                        flexShrink: 0,
                                    },
                                }}
                            >
                                <Select
                                    value={filter.field}
                                    onChange={(e: SelectChangeEvent<string>) => handleFilterChange(index, "field", e.target.value)}
                                    size="small"
                                    sx={{ width: 180 }}
                                >
                                    {fields.map((f) => (
                                        <MenuItem key={f.value} value={f.value}>
                                            {f.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    value={filter.operator}
                                    onChange={(e: SelectChangeEvent<string>) => handleFilterChange(index, "operator", e.target.value)}
                                    size="small"
                                    sx={{ width: 180 }}
                                >
                                    {availableOperators.map((op) => (
                                        <MenuItem key={op.value} value={op.value}>
                                            {op.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <TextField
                                    value={filter.value}
                                    onChange={(e) => handleFilterChange(index, "value", e.target.value)}
                                    placeholder={t("filter_value")}
                                    size="small"
                                    disabled={["isnull", "isnotnull", "isempty", "isnotempty"].includes(filter.operator)}
                                    sx={{ width: 180 }}
                                />
                                {/* {index > 0 && (
                                    <Select
                                        value={filter.logic || "AND"}
                                        onChange={(e: SelectChangeEvent<string>) => handleFilterChange(index, "logic", e.target.value)}
                                        size="small"
                                        sx={{ width: 80 }}
                                    >
                                        <MenuItem value="AND">{t("and")}</MenuItem>
                                        <MenuItem value="OR">{t("or")}</MenuItem>
                                    </Select>
                                )} */}
                                <IconButton onClick={() => handleRemoveFilter(index)} disabled={filters.length === 1}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        );
                    })}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Button variant="outlined" onClick={handleAddFilter} startIcon={
                            <IconifyIcon icon='stash:plus-solid' />
                        }>
                            {t("add_filter")}
                        </Button>
                        <Button variant="outlined" color="error" onClick={handleRemoveAllFilters} startIcon={
                            <IconifyIcon icon="mdi:delete-forever-outline" />
                        }>
                            {t("remove_all_filter")}
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
};

export default AdminFilter;