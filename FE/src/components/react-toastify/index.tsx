// ** MUI Imports
import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useSettings } from 'src/hooks/useSettings'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ReactToastify = styled(Box)<BoxProps>(({ theme }) => {
    // ** Hook & Var
    const { settings } = useSettings()
    const { layout, navHidden } = settings

    return {
        '& .Toastify__toast-container': {
            left: `${theme.spacing(6)} !important`,
            right: `${theme.spacing(6)} !important`,
            bottom: `${theme.spacing(6)} !important`,
            top: layout === 'horizontal' && !navHidden ? '139px !important' : '75px !important',
            zIndex: useMediaQuery(theme.breakpoints.down('lg'))
                ? `${theme.zIndex.modal - 1} !important`
                : `${theme.zIndex.modal + 1} !important`
        },
        '& .Toastify__toast': {
            fontWeight: 400,
            letterSpacing: '0.14px',
            boxShadow: theme.shadows[4],
            color: theme.palette.text.primary,
            borderRadius: theme.shape.borderRadius,
            fontSize: theme.typography.body1.fontSize,
            background: theme.palette.background.paper,
            '& .Toastify__close-button': {
                opacity: 0.7
            }
        }
    }
})

const CustomToastContainer = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    )
}

export default CustomToastContainer 