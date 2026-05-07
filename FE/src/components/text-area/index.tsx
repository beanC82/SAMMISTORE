import { FormHelperText, InputLabel, TextareaAutosizeProps } from "@mui/material"
import { Box, TextareaAutosize, useTheme } from "@mui/material"
import { styled } from "@mui/material"

interface TCustomTextArea extends TextareaAutosizeProps {
    label?: string
    error?: boolean
    helperText?: string
    hideResize?: boolean
}

const StyledTextArea = styled(TextareaAutosize)<TCustomTextArea>(({ theme, hideResize, error }) => {
    return {
        borderRadius: hideResize ? '8px': '8px 8px 0px 8px',
        padding: '10px 10px 10px 12px',
        resize: hideResize ? "none" : "block",
        color: theme.palette.text.primary,
        width: '100%',
        fontSize: '0.9375rem',
        backgroundColor: 'inherit',
        border: error ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.customColors.borderColor}`,
        "&:focus": {
            border: `1px solid ${theme.palette.primary.main}`,
            outline: "none"
        },

        "&:disabled": {
            backgroundColor: theme.palette.action.disabledBackground
        },

        "&::placeholder": {
            color: `1px solid ${theme.palette.customColors.borderColor}`,
            opacity: 0.42
        }
    }
})

const CustomTextArea = (props: TCustomTextArea) => {
    const { error, label, helperText, ...rests } = props

    const theme = useTheme()

    return (
        <Box>
            <InputLabel sx={{
                fontSize: "13px",
                mb: "4px",
                display: "block",
                color: error ? theme.palette.error.main : theme.palette.customColors.main
            }}>
            {label}
            </InputLabel>
            <StyledTextArea error={error} {...rests} />
            {
                helperText && (
                    <FormHelperText sx={{
                        color: theme.palette.error.main,
                        // mt: "10px"
                    }}>
                        {helperText}
                    </FormHelperText>
                )
            }
        </Box>
    )
}

export default CustomTextArea