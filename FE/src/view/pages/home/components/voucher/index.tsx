import React, { useEffect, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Box, IconButton, Typography, useTheme, Button } from '@mui/material';
import IconifyIcon from 'src/components/Icon';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { getTopVouchers, saveVoucher } from 'src/services/voucher';
import { toast } from 'react-toastify';
import { Card } from '@mui/material';



function PrevArrow(props: any) {
    const { onClick } = props;
    return (
        <IconButton
            onClick={onClick}
            sx={{
                position: "absolute",
                left: "16px",
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(0, 0, 0, 0.5)",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                    color: "rgba(0, 0, 0, 1)",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                },
            }}
        >
            <IconifyIcon icon="lucide:chevron-left" fontSize="2rem" />
        </IconButton>
    );
}

function NextArrow(props: any) {
    const { onClick } = props;
    return (
        <IconButton
            onClick={onClick}
            sx={{
                position: "absolute",
                right: "16px",
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(0, 0, 0, 0.5)",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                    color: "rgba(0, 0, 0, 1)",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                },
            }}
        >
            <IconifyIcon icon="lucide:chevron-right" fontSize="2rem" />
        </IconButton>
    );
}

interface ListVoucherProps {
    initialData?: any[];
}

const ListVoucher: React.FC<ListVoucherProps> = ({ initialData }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const response = await getTopVouchers({ numberTop: 10, isPublic: true });
            if (response.isSuccess) {
                setVouchers(response.result);
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVoucher = async (voucherId: number) => {
        try {
            const response = await saveVoucher(voucherId);
            if (response.isSuccess) {
                toast.success(t('save_voucher_success'));
            } else {
                toast.error(response.message || t('save_voucher_failed'));
            }
        } catch (error) {
            toast.error(t('save_voucher_failed'));
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const settings: Settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: 'linear',
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        swipe: true,
        draggable: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    arrows: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    arrows: false,
                },
            },
        ],
    };

    return (
        <Box sx={{ maxWidth: '1440px', margin: '4px auto', height: { xs: 'auto', md: '216px' }, backgroundColor: theme.palette.background.paper }}>
            <Slider {...settings}>
                {vouchers.map((voucher) => (
                    <Box
                        key={voucher.id}
                        sx={{ width: '345px', mr: '10px' }}
                    >
                        <Card sx={{ pl: '15px', width: '315px', height: '120px', pr: '15px', pb: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)', }}>
                            <Box sx={{ width: '100px', height: '131px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconifyIcon 
                                    icon="mdi:ticket-percent" 
                                    width={100} 
                                    height={100}
                                    color={theme.palette.secondary.main}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', flexDirection: 'column', }}>
                                <Typography color={theme.palette.secondary.main} sx={{ fontSize: '14px', fontWeight: 'bold', textWrap: 'wrap' }}>NHẬP MÃ: {voucher.code}</Typography>
                                <Typography color={theme.palette.grey[600]} fontSize="13px" sx={{ mb: 1 }}>{voucher.name}</Typography>
                                <Button variant="contained"
                                    onClick={() => handleSaveVoucher(voucher.id)}
                                    sx={{
                                        backgroundColor: theme.palette.primary.main, 
                                        color: 'white', 
                                        borderRadius: '99px', 
                                        width: '100px', 
                                        textWrap: 'nowrap', 
                                        fontSize: '12px',
                                        alignSelf: 'flex-start',
                                        "&:hover": { backgroundColor: theme.palette.secondary.main},
                                    }}>{t('save_voucher')}</Button>
                            </Box>
                        </Card>
                    </Box>
                ))}
            </Slider>
        </Box>
    );
};

export default ListVoucher;