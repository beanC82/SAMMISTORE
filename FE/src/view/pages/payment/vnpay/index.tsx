import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useEffect, useState, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { m } from 'framer-motion'

// Dynamic import cho các components MUI
const Box = dynamic(() => import('@mui/material/Box'))
const Button = dynamic(() => import('@mui/material/Button'))
const Card = dynamic(() => import('@mui/material/Card'))
const Typography = dynamic(() => import('@mui/material/Typography'))

// Dynamic import cho các components custom
const IconifyIcon = dynamic(() => import('src/components/Icon'))

// Import config và services
import { ROUTE_CONFIG } from 'src/configs/route'
import { getVNPayPaymentIpn } from 'src/services/payment'
import { useTheme } from '@mui/material'

// Component chính
const PaymentPage = () => {
  // State quản lý dữ liệu thanh toán
  const [paymentData, setPaymentData] = useState({
    status: "",
    totalPrice: 0
  })

  // Hooks
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const { vnp_SecureHash, vnp_ResponseCode, vnp_TxnRef, ...rests } = router.query

  // Callback function để fetch IPN từ VNPay
  const fetchGetIpnVNPay = useCallback(async (param: any) => {
    try {
      const res = await getVNPayPaymentIpn({
        params: {
          ...param
        }
      })

      const data = res?.data?.RspCode
      if (data) {
        setPaymentData({
          status: data.RspCode,
          totalPrice: data.totalPrice
        })
      }
    } catch (error) {
      console.error('Error fetching VNPay IPN:', error)
    }
  }, [])

  // Effect để gọi API khi có đủ thông tin
  useEffect(() => {
    if (vnp_SecureHash && vnp_ResponseCode && vnp_TxnRef) {
      fetchGetIpnVNPay({ vnp_SecureHash, vnp_ResponseCode, orderId: vnp_TxnRef, vnp_TxnRef, ...rests })
    }
  }, [vnp_SecureHash, vnp_ResponseCode, vnp_TxnRef, fetchGetIpnVNPay])

  // Animation config cho icon
  const iconAnimation = {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity }
  }

  return (
    <Box sx={{
      minHeight: '50vh',
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        color: theme.palette.primary.main,
        textAlign: 'center'
      }}>
        {/* Animation icon */}
        <m.div {...iconAnimation}>
          <Box sx={{ fontSize: 128 }}>🎉</Box>
        </m.div>

        {/* Thông báo thành công */}
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
          Đặt hàng thành công
        </Typography>

        {/* Mô tả */}
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, maxWidth: '500px' }}>
          Chúc mừng quý khách hàng đã đặt hàng tại Sammi Stores. Nhân viên của chúng tôi sẽ liên hệ lại quý khách hàng khi đơn hàng được xác nhận. Quý khách hàng có thể theo dõi bằng cách đăng nhập và theo dõi đơn hàng trên website của chúng tôi.
        </Typography>

        {/* Các nút điều hướng */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            onClick={() => router.push(ROUTE_CONFIG.HOME)}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.background.paper,
              '&:hover': {
                bgcolor: theme.palette.primary.main,
                opacity: 0.9
              }
            }}
          >
            Trang chủ
          </Button>
          <Button
            onClick={() => router.push(ROUTE_CONFIG.ACCOUNT.MY_ORDER)}
            variant="outlined"
            sx={{
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: 'rgba(0,0,0,0.1)'
              }
            }}
          >
            Đơn mua
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

// Memoize component để tránh re-render không cần thiết
export default memo(PaymentPage)
