import { Box, Container, Typography, Button, Paper } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useRouter } from 'next/router'

export default function NotFound() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
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
          <HelpOutlineIcon sx={{ fontSize: 80, color: '#e91e63', mb: 2 }} />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: '#e91e63',
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem' },
            }}
          >
            404 - Không Tìm Thấy Trang
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
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại trong hệ thống quản lý cửa hàng mỹ phẩm. Vui lòng kiểm tra lại URL hoặc quay về trang chính.
          </Typography>
          <Button
            variant="contained"
            onClick={handleGoHome}
            sx={{
              bgcolor: '#e91e63',
              '&:hover': {
                bgcolor: '#d81b60',
              },
            }}
          >
            Quay Lại Trang Chủ
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}
