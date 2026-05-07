import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, styled, Typography } from "@mui/material"
import IconifyIcon from "../Icon"
import { useTheme } from "@mui/material"
import { useTranslation } from "react-i18next"

interface TConfirmDialog {
    open: boolean,
    onClose: () => void,
    title: string,
    description: string,
    handleConfirm: () => void,
    handleCancel: () => void
}

const CustomDialogContentText = styled(DialogContentText)(() => ({
    padding: "10px 20px"
}))

const CustomDialog = styled(Dialog)(() => ({
    ".MuiPaper-root.MuiPaper-elevation": {
        width: "400px"
    }
}))

const ConfirmDialog = (props: TConfirmDialog) => {
    //props
    const { open, onClose, title, description, handleConfirm, handleCancel } = props
    const theme = useTheme()
    const {t} = useTranslation()

    return (
        <CustomDialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "20px" }}>
                <IconifyIcon icon="mdi:alert-circle-outline" fontSize="5rem" color={theme.palette.warning.main} />
            </Box>
            <DialogTitle sx={{
                textAlign: "center"
            }}>
                <Typography variant="h4" fontWeight={600} sx={{ padding: 0 }}>
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <CustomDialogContentText sx={{ textAlign: "center", padding: "5px !important", mb: "10px" }}>
                    {description}
                </CustomDialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="error" variant="outlined" onClick={handleCancel}>{t('cancel')}</Button>
                <Button variant="contained" onClick={handleConfirm} >
                    {t('confirm')}
                </Button>
            </DialogActions>
        </CustomDialog>
    )
}

export default ConfirmDialog