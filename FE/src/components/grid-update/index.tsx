import { Box, IconButton, Tooltip } from "@mui/material"
import { ModalProps } from "@mui/material"
import { Modal, styled, Typography } from "@mui/material"
import IconifyIcon from "../Icon"
import { useTranslation } from "../../../node_modules/react-i18next"

interface TGridUpdate {
    onClick: () => void
    disabled?: boolean
}

const GridUpdate = (props: TGridUpdate) => {

    const { onClick, disabled } = props

    const { t } = useTranslation()
    return (
        <Tooltip title="Chỉnh sửa">
            <IconButton onClick={onClick} disabled={disabled}>
                <IconifyIcon icon="hugeicons:task-edit-01" />
            </IconButton>
        </Tooltip>
    )
}

export default GridUpdate