import { Box, Container, Typography, Button, Paper } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useRouter } from 'next/router'

export default function InternalServerError() {
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
          <ErrorOutlineIcon sx={{ fontSize: 80, color: '#e91e63', mb: 2 }} />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: '#e91e63',
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem' },
            }}
          >
            500 - Lỗi Máy Chủ
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
            Xin lỗi, đã có lỗi xảy ra trong hệ thống quản lý cửa hàng mỹ phẩm. Vui lòng thử lại sau hoặc liên hệ quản trị viên để được hỗ trợ.
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
