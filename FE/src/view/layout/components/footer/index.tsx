import React, { lazy, Suspense } from 'react';
// Import core MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { styled, useTheme, useMediaQuery } from '@mui/material';
import Spinner from 'src/components/spinner';
// Dynamically import icons to reduce initial bundle size
const Facebook = lazy(() => import('@mui/icons-material/Facebook'));
const Twitter = lazy(() => import('@mui/icons-material/Twitter'));
const Instagram = lazy(() => import('@mui/icons-material/Instagram'));
const YouTube = lazy(() => import('@mui/icons-material/YouTube'));
const Apple = lazy(() => import('@mui/icons-material/Apple'));
const Android = lazy(() => import('@mui/icons-material/Android'));
const Payment = lazy(() => import('@mui/icons-material/Payment'));

// Styled components
const StyledFooter = styled(Box)(({ theme }) => ({
    backgroundColor: '#fff',
    padding: theme.spacing(6, 0),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const SocialIcon = styled(Link)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
    '&:hover': {
        color: theme.palette.primary.main,
    },
}));

const Footer: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Fallback for Suspense
    const IconFallback = () => <Spinner />;

    return (
        <StyledFooter>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Contact Information */}
                    <Grid item xs={12} md={3}>
                        <Box mb={2}>
                            <Typography component="h4" variant="h3" color="primary" noWrap
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "fit-content",
                                    fontWeight: "600",
                                    background: "linear-gradient(to right, #d82e4d, #f26398)",
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    cursor: "pointer"
                                }}>Sammi Stores
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Cửa hàng mỹ phẩm SammiStores.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Địa chỉ: 96 P. Định Công, Phương Liệt, Thanh Xuân, Hà Nội
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Số điện thoại: 0949067693
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email: cskh@sammistores.com
                        </Typography>
                        <Stack direction="row" spacing={2} mt={2}>
                            <SocialIcon href="#">
                                <Suspense fallback={<IconFallback />}>
                                    <Facebook />
                                </Suspense>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <Suspense fallback={<IconFallback />}>
                                    <Twitter />
                                </Suspense>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <Suspense fallback={<IconFallback />}>
                                    <Instagram />
                                </Suspense>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <Suspense fallback={<IconFallback />}>
                                    <YouTube />
                                </Suspense>
                            </SocialIcon>
                        </Stack>
                    </Grid>

                    {/* About Us */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Về chúng tôi
                        </Typography>
                        <Stack spacing={1}>
                            {['Câu chuyện thương hiệu', 'Điều khoản dịch vụ', 'Tuyển dụng',
                                'Hệ thống cửa hàng', 'Chứng nhận đại lý chính hãng'].map((item) => (
                                    <Link href="#" key={item} color="text.secondary" underline="hover">
                                        {item}
                                    </Link>
                                ))}
                        </Stack>
                    </Grid>

                    {/* Policies */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Chính sách
                        </Typography>
                        <Stack spacing={1}>
                            {['Hướng dẫn mua hàng', 'Quy định và hình thức thanh toán',
                                'Chính sách giao hàng', 'Chính sách đổi trả',
                                'Chính sách tích lũy điểm', 'Chính sách bảo mật thông tin',
                                'Giao hàng siêu tốc 1H'].map((item) => (
                                    <Link href="#" key={item} color="text.secondary" underline="hover">
                                        {item}
                                    </Link>
                                ))}
                        </Stack>
                    </Grid>

                    {/* Newsletter & Payment */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Đăng ký nhận tin
                        </Typography>
                        <Box display="flex" mb={3}>
                            <TextField
                                size="small"
                                placeholder="Nhập địa chỉ email"
                                sx={{ flexGrow: 1, mr: 1 }}
                            />
                            <Button variant="contained" color="primary" sx={{ textWrap: 'nowrap' }}>
                                Đăng ký
                            </Button>
                        </Box>

                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Phương thức thanh toán
                        </Typography>
                        <Box mb={2}>
                            <Suspense fallback={<IconFallback />}>
                                <Payment sx={{ fontSize: 40 }} />
                            </Suspense>
                        </Box>

                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Tải ngay App SammiStores
                        </Typography>
                        <Stack direction={isMobile ? "row" : "column"} spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={
                                    <Suspense fallback={<IconFallback />}>
                                        <Apple />
                                    </Suspense>
                                }
                                fullWidth
                            >
                                App Store
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={
                                    <Suspense fallback={<IconFallback />}>
                                        <Android />
                                    </Suspense>
                                }
                                fullWidth
                            >
                                Google Play
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </StyledFooter>
    );
};

export default Footer;
