import { Box, IconButton, Tooltip } from "@mui/material"
import { ModalProps } from "@mui/material"
import { Modal, styled, Typography } from "@mui/material"
import IconifyIcon from "../Icon"
import { useTranslation } from "react-i18next"

interface TGridDetail {
    onClick: () => void
    disabled?: boolean
}

const GridDetail = (props: TGridDetail) => {

    const { onClick, disabled } = props
    const { t } = useTranslation()

    return (
        <Tooltip title={t('view_detail')}>
            <IconButton onClick={onClick} disabled={disabled}>
                <IconifyIcon icon="lucide:eye" />
            </IconButton>
        </Tooltip>
    )
}

export default GridDetail