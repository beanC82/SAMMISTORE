// ** MUI Imports
import { Button, IconButton } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '../Icon'
import { memo } from 'react'
const StyledTableHeader = styled(Box)(({ theme }) => ({
    borderRadius: "15px",
    border: `1px solid ${theme.palette.customColors.borderColor}`,
    padding: "8px 10px",
    width: "100%",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
}))

type TProp = {
    selectedRowNumber?: number,
    onClear: () => void,
    actions: { label: string, value: string, disabled?: boolean }[],
    handleAction: (type: string) => void,
    selectedRows?: number[]
}

const TableHeader = (props: TProp) => {
    //Props
    const { selectedRowNumber, onClear, actions, handleAction } = props

    // ** Hook
    const theme = useTheme()
    const { t } = useTranslation()

    return (
        <StyledTableHeader>
            <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px"
            }}>
                <Typography>{t("selected_row")}</Typography>
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "12px !important",
                        backgroundColor: theme.palette.primary.main,
                        height: "20px",
                        width: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        color: theme.palette.customColors.lightPaperBg
                    }}
                >
                    <span>{selectedRowNumber}</span>
                </Typography>
            </Box>
            <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px"
            }}>
                {actions?.map((action) => {
                    return (
                        <Button disabled={action?.disabled} key={action.value} variant="contained" onClick={() => handleAction(action.value)}>
                            {action.label}
                        </Button>
                    )
                })}
                <IconButton onClick={onClear}>
                    <IconifyIcon icon="material-symbols-light:close-rounded" fontSize={"20px"} />
                </IconButton>
            </Box>
        </StyledTableHeader>
    )
}

export default memo(TableHeader)
