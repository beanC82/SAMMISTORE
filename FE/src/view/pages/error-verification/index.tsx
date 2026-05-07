import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    Link as MuiLink,
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface FormData {
    email: string;
}

const schema = yup.object().shape({
    email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
});

export default function ErrorVerification() {
    const router = useRouter();
    const { token } = router.query;
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (token) {
            confirmEmail();
        }
    }, [token]);

    const confirmEmail = async () => {
        try {
            const response = await fetch(`/api/account/confirm-email?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();

            if (result.success) {
                router.push(`/email-confirmed?email=${result.data.email}`);
            } else {
                setErrorMessage(result.error);
                if (result.data?.email) {
                    setEmail(result.data.email);
                    setValue('email', result.data.email);
                }
            }
        } catch (error) {
            setErrorMessage('Đã xảy ra lỗi khi xác nhận email. Vui lòng thử lại sau.');
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            const response = await fetch('/api/account/resend-confirmation-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: data.email }),
            });
            const result = await response.json();

            if (result.success) {
                router.push(`/login?message=${encodeURIComponent(result.message)}`);
            } else {
                setErrorMessage(result.error);
            }
        } catch (error) {
            setErrorMessage('Đã xảy ra lỗi khi gửi lại email xác nhận. Vui lòng thử lại sau.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #fff5f7, #ffeef0)',
                fontFamily: 'Arial, sans-serif',
                color: '#333',
            }}
        >
            <Card
                sx={{
                    maxWidth: 500,
                    width: '100%',
                    borderRadius: '15px',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff',
                    border: '1px solid #f8d7da',
                }}
            >
                <CardHeader
                    title={
                        <Typography variant="h4" sx={{ margin: 0, fontWeight: 400, fontSize: '1.5rem' }}>
                            Lỗi xác thực email
                        </Typography>
                    }
                    sx={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderTopLeftRadius: '15px',
                        borderTopRightRadius: '15px',
                        padding: '1rem',
                        '& .MuiCardHeader-content': {
                            overflow: 'visible'
                        }
                    }}
                />
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h3" mt={4} sx={{ color: '#6c757d' }}>
                            Sammi Store
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <ErrorIcon sx={{ fontSize: 64, color: '#dc3545' }} />
                    </Box>

                    {errorMessage && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                '& .MuiAlert-icon': {
                                    color: '#721c24'
                                }
                            }}
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 4 }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography component="label" htmlFor="email" sx={{ display: 'block', mb: 1, color: '#333' }}>
                                Địa chỉ email của bạn
                            </Typography>
                            <TextField
                                id="email"
                                fullWidth
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                        backgroundColor: '#fff',
                                        '& fieldset': {
                                            borderColor: '#ced4da',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#ff6f91',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#ff6f91',
                                        }
                                    }
                                }}
                                InputProps={{
                                    readOnly: !!email,
                                }}
                            />
                        </Box>
                        <Button
                            type="submit"
                            sx={{
                                backgroundColor: '#ff6f91',
                                border: 'none',
                                padding: '10px 20px',
                                fontSize: '16px',
                                fontWeight: 500,
                                borderRadius: '25px',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: '#ff4d73',
                                },
                            }}
                        >
                            Gửi lại email xác nhận
                        </Button>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <MuiLink
                            component={Link}
                            href="/login"
                            sx={{
                                color: '#ff6f91',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                    color: '#ff4d73',
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Quay lại đăng nhập
                        </MuiLink>
                    </Box>
                </CardContent>
                <Box
                    sx={{
                        textAlign: 'center',
                        p: 2,
                        borderTop: '1px solid rgba(0,0,0,0.1)',
                        '& a': {
                            color: '#ff6f91',
                            textDecoration: 'none',
                            '&:hover': {
                                color: '#ff4d73',
                                textDecoration: 'underline',
                            },
                        }
                    }}
                >
                    <Typography sx={{ mb: 0 }}>
                        Quay lại{' '}
                        <MuiLink component={Link} href="/">
                            Trang chủ Sammi Store
                        </MuiLink>
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
}
