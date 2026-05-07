
//Mui
import { Box, Button, IconButton, Typography } from "@mui/material"
import { useTheme } from "@mui/material"

//components
import CustomModal from "src/components/custom-modal"
import IconifyIcon from "src/components/Icon"

//translation
import { useTranslation } from "react-i18next"
import { useRouter } from "next/router"
import { ROUTE_CONFIG } from "src/configs/route"



interface TWarningModal {
    open: boolean
    onClose: () => void
}


const WarningModal = (props: TWarningModal) => {


    //props
    const { open, onClose } = props

    //hooks
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()

    return (
        <>
            <CustomModal open={open} onClose={onClose}>
                <Box
                    sx={{
                        backgroundColor: theme.palette.customColors.bodyBg,
                        padding: '20px',
                        borderRadius: '15px',
                    }}
                    minWidth={{ md: '40px', xs: '80vw' }}
                    maxWidth={{ md: '60vw', xs: '80vw' }}
                >
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        paddingBottom: '20px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {t('warning')}
                        </Typography>
                    </Box>
                    <Box sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "15px",
                        py: 5, px: 4
                    }}>
                        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                            <IconifyIcon icon='ep:warning' fontSize={80} color={theme.palette.warning.main} />
                        </Box>
                        <Typography sx={{ textAlign: 'center', mt: 4 }}>{t('order_warning')}</Typography>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button variant="contained" onClick={() => router.push(ROUTE_CONFIG.HOME)}>
                                {t('return_home')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </CustomModal>
        </>
    )
}

export default WarningModal