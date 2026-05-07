// MUI Imports

import { styled, TextField, TextFieldProps } from "@mui/material"

const CustomTextFieldStyled = styled(TextField)<TextFieldProps>(({ theme }) => {
    return {
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
    }
})

const CustomTextField = (props: TextFieldProps) => {
    const { size = "small", InputLabelProps, variant = "outlined", ...rests } = props
    return <CustomTextFieldStyled size={size} variant={variant} InputLabelProps={{ ...InputLabelProps }} {...rests} />
}

export default CustomTextField
