import { BoxProps, FormHelperText, useTheme } from '@mui/material';
import { Box, styled } from "@mui/material"
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import IconifyIcon from '../Icon';
import { useRef } from 'react';
import { InputLabel } from '@mui/material';


interface TCustomDatePicker extends ReactDatePickerProps {
    selectedDate?: Date | null
    placeholder?: string
    error?: boolean
    helperText?: string
    label?: string
}

interface StyledDatePickerProps extends BoxProps {
    error?: boolean
}

const StyledDatePicker = styled(Box)<StyledDatePickerProps>(({ theme, error }) => ({

    backgroundColor: 'transparent !important',
    border: error ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.customColors.borderColor}`,
    height: "38px",
    padding: "8px",
    position: "relative",
    borderRadius: 8,
    ".react-datepicker__header": {
        backgroundColor: `${theme.palette.background.paper} !important`,
        ".react-datepicker__day-name": {
            color: `rgba(${theme.palette.customColors.main}, 0.8)`,
        },
        ".react-datepicker__current-month": {
            color: `rgba(${theme.palette.customColors.main}, 1)`,
        },
    },
    ".react-datepicker-wrapper": {
        width: "100%",
        border: 'none',
        input: {
            width: "100%",
            border: "none",
            outline: "none",
            color: `rgba(${theme.palette.customColors.main}, 0.42)`,
            backgroundColor: "transparent"
        }
    },
    ".react-datepicker__day--disabled": {
        backgroundColor: `${theme.palette.action.selected} !important`,
        borderRadius: "0.3rem"
    },
    ".react-datepicker-popper": {
        zIndex: "2 !important"
    },
    ".react-datepicker__day--keyboard-selected": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.customColors.lightPaperBg
    },
    ".react-datepicker__month-container": {
        border: `1px solid ${theme.palette.customColors.borderColor}`,
        ".react-datepicker__month": {
            backgroundColor: theme.palette.customColors.bodyBg,
            margin: 0,
            padding: "0.4rem",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px"
        },
        ".react-datepicker__day": {
            color: `rgba(${theme.palette.customColors.main}, 0.42)`,
            "&:hover": {
                backgroundColor: `rgba(${theme.palette.customColors.main}, 0.08)`
            },
            "&.react-datepicker__day--selected": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.customColors.lightPaperBg
            }
        }
    },
    ".react-datepicker": {
        border: "none"
    }
}))

const CustomDatePicker = (props: TCustomDatePicker) => {

    const { selectedDate, onChange, placeholder, error, helperText, label, ...rests } = props
    const refDatePicker = useRef<any>(null)
    const theme = useTheme()

    const handleFocusCalendar = () => {
        if (refDatePicker.current) {
            refDatePicker.current?.setFocus()
        }
    }

    return (
        <Box>
            <InputLabel sx={{
                fontSize: "13px",
                mb: "4px",
                display: "block",
                color: error ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.68)`
            }}>
                {label}
            </InputLabel>
            <StyledDatePicker error={error}>
                <ReactDatePicker placeholderText={placeholder} ref={refDatePicker} selected={selectedDate} onChange={onChange} {...rests} />
                <IconifyIcon icon="oui:token-date" className='absolute top-[4px] right-[8px]' fontSize={30} onClick={handleFocusCalendar} />
                {helperText && (
                    <FormHelperText sx={{
                        color: theme.palette.error.main,
                        mt: "10px"
                    }}>
                        {helperText}
                    </FormHelperText>
                )}
            </StyledDatePicker>
        </Box>
    )
}

export default CustomDatePicker