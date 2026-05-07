import { Box, InputLabel, styled, FormControl } from "@mui/material";
import Select, { SelectProps } from "@mui/material/Select";
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";
import { useTranslation } from "react-i18next";

type TCustomSelect = SelectProps & {
  options: { label: string; value: string | number }[];
};

const StyledSelect = styled(Select)<SelectProps>(({ theme }) => ({
  "& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input": {
    padding: "14px 8px 8px 12px !important", 
    height: "38px",
    boxSizing: "border-box",
    display: "flex",        
    alignItems: "center", 
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.grey[500],
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.grey[700],
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

const StyledMenuItem = styled(MenuItem)<MenuItemProps>(({ theme }) => ({}));

const CustomSelect = (props: TCustomSelect) => {
  const { value, label, onChange, options, placeholder, fullWidth, ...rest } = props;
  const { t } = useTranslation();

  return (
    <FormControl fullWidth={fullWidth}>
      {label && (
        <InputLabel
          id={`custom-select-label-${label}`}
          shrink={true} 
          sx={{
            transform: "translate(14px, -6px) scale(0.75)",
            transformOrigin: "top left",
          }}
        >
          {label}
        </InputLabel>
      )}
      <StyledSelect
        labelId={label ? `custom-select-label-${label}` : undefined}
        fullWidth={fullWidth}
        id="demo-select-small"
        value={value}
        label={label} 
        size="medium"
        onChange={onChange}
        displayEmpty
        {...rest}
      >
        {placeholder && !value && (
          <StyledMenuItem value="" disabled>
            <em>{placeholder}</em>
          </StyledMenuItem>
        )}
        {options?.length > 0 ? (
          options.map((opt) => (
            <StyledMenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </StyledMenuItem>
          ))
        ) : (
          <StyledMenuItem disabled>{t("no_data")}</StyledMenuItem>
        )}
      </StyledSelect>
    </FormControl>
  );
};

export default CustomSelect;