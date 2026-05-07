import { Box, Button, IconButton, Tooltip, useTheme } from "@mui/material"
import { ModalProps } from "@mui/material"
import { Modal, styled, Typography } from "@mui/material"
import IconifyIcon from "../Icon"
import { useTranslation } from "../../../node_modules/react-i18next"

interface TGridCreate {
    onClick: () => void
    disabled?: boolean
    addText: string
}

const GridCreate = (props: TGridCreate) => {

    const { onClick, disabled, addText } = props
    const { t } = useTranslation()

    const theme = useTheme()

    return (
        <Tooltip title={t('create')}>
            <Button
                onClick={onClick}
                disabled={disabled}
                startIcon={
                    <IconifyIcon icon="ic:round-plus" />
                }
                sx={{
                    backgroundColor: `${theme.palette.primary.main} !important`,
                    color: `${theme.palette.common.white}`
                }}>
                <Typography sx={{ color: `${theme.palette.common.white}` }} >{addText}</Typography>
            </Button>
        </Tooltip>
    )
}

export default GridCreate