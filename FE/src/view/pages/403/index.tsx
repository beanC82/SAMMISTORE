import { Box, Container, Typography, Button, Paper } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'

export default function Unauthorized() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogoutAndRedirect = () => {
    logout()
    router.push('/login')
  }

  return (
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f1f1',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <LockIcon sx={{ fontSize: 80, color: '#e91e63', mb: 2 }} />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: '#e91e63',
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem' },
            }}
          >
            403 - Truy Cập Bị Từ Chối
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: '#333',
              fontSize: '1.125rem',
              lineHeight: 1.6,
            }}
          >
            Xin lỗi, bạn không có quyền truy cập vào trang này trong hệ thống quản lý cửa hàng mỹ phẩm. Vui lòng kiểm tra lại thông tin đăng nhập hoặc liên hệ quản trị viên để được hỗ trợ.
          </Typography>
          <Button
            variant="contained"
            onClick={handleLogoutAndRedirect}
            sx={{
              bgcolor: '#e91e63',
              '&:hover': {
                bgcolor: '#d81b60',
              },
            }}
          >
            Quay Lại Trang Đăng Nhập
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}
