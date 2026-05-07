import { Box } from "@mui/material"
import { ModalProps } from "@mui/material"
import { Modal, styled, Typography } from "@mui/material"

interface TCustomModal extends ModalProps {
    onClose: () => void
}

const StyledModal = styled(Modal)<ModalProps>(({ theme }) => ({
    zIndex: 1300,
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
}))

const CustomModal = (props: TCustomModal) => {

    const { children, onClose, open } = props
    return (
        <StyledModal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{
                height: '100%',
                width: '100vw',
                overflow: 'auto',
            }}>
                <Box sx={{
                    maxHeight: '100vh',
                    overflow: 'auto',
                }}>
                    <Box sx={{
                        height: '100%',
                        width: '100%',
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Box sx={{
                            margin: "40px 0"
                        }}>
                            {children}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </StyledModal>
    )
}

export default CustomModal