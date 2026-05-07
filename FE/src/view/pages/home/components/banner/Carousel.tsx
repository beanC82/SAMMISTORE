import { memo, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import dynamic from 'next/dynamic';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import IconifyIcon from 'src/components/Icon';
import Slider from 'react-slick';
import Banner1 from '/public/images/slider_1_master.png';
import Banner2 from '/public/images/slider_2_master.png';
import Banner3 from '/public/images/slider_3_master.png';

interface Banner {
    id: number;
    image: StaticImageData;
    title?: string;
    description?: string;
}

// Default banners to use when no initialData is provided
const defaultBanners: Banner[] = [
    {
        id: 1,
        image: Banner1,
    },
    {
        id: 2,
        image: Banner2,
    },
    {
        id: 3,
        image: Banner3,
    },
];

interface ArrowProps {
    onClick?: () => void;
}

interface CarouselProps {
    initialData?: any[];
}

const PrevArrow: FC<ArrowProps> = memo(({ onClick }) => (
    <IconButton
        onClick={onClick}
        sx={{
            position: "absolute",
            left: "16px",
            top: '38%',
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
));

const NextArrow: FC<ArrowProps> = memo(({ onClick }) => (
    <IconButton
        onClick={onClick}
        sx={{
            position: "absolute",
            right: "16px",
            top: '38%',
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
));

const Carousel: FC<CarouselProps> = ({ initialData }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    // Use initialData if available, otherwise use default banners
    const banners = useMemo(() => {
        if (initialData && initialData.length > 0) {
            // Map the API data to the banner format
            return initialData.map((item, index) => ({
                id: item.id || index + 1,
                image: item.imageUrl || defaultBanners[index % defaultBanners.length].image,
                title: item.name || '',
                description: item.description || '',
            }));
        }
        return defaultBanners;
    }, [initialData]);

    const settings = useMemo(() => ({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: 'linear',
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        swipe: true,
        draggable: true,
        appendDots: (dots: React.ReactNode) => (
            <Box
                sx={{
                    margin: '0 auto',
                    width: '100%',
                    padding: 0,
                    listStyle: 'none',
                    zIndex: 2,
                }}
            >
                <ul style={{
                    margin: '0 auto', padding: 0,
                    display: 'flex', gap: '8px',
                    position: 'absolute',
                    bottom: '12.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    justifyContent: 'center'
                }}>
                    {dots}
                </ul>
            </Box>
        ),
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
    }), []);

    const renderBanner = useCallback((banner: Banner) => (
        <Box
            key={banner.id}
            sx={{
                position: 'relative',
                width: '100%',
                height: { xs: '300px', md: '616px' },
                overflow: 'hidden',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: false }}
                style={{ width: '100%', height: '100%' }}
            >
                <Image
                    src={banner.image}
                    alt={banner?.title || 'Banner'}
                    style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                    priority
                />
            </motion.div>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: 'white',
                    zIndex: 1,
                }}
            >
                {/* Animation for Title */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    viewport={{ once: false }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', md: '3rem' },
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            color: theme.palette.common.white,
                            fontFamily: '"Dancing Script", cursive',
                        }}
                    >
                        {banner?.title}
                    </Typography>
                </motion.div>

                {/* Animation for Description */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    viewport={{ once: false }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontSize: { xs: '1rem', md: '1.5rem' },
                            fontWeight: 'normal',
                            color: theme.palette.common.white,
                            fontFamily: '"Playfair Display", serif',
                        }}
                    >
                        {banner?.description}
                    </Typography>
                </motion.div>

                {/* Animation for Button */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    viewport={{ once: false }}
                >
                    {banner?.title && (
                        <Link href="/products" passHref>
                            <Button
                                variant="outlined"
                                sx={{
                                    color: 'white',
                                    padding: '0.75rem 2rem',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    borderColor: 'white',
                                    marginTop: '1rem',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                }}
                            >
                                {t('view_more')}
                            </Button>
                        </Link>
                    )}
                </motion.div>
            </Box>
        </Box>
    ), [t, theme.palette.common.white]);

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <Slider {...settings}>
                {banners.map(renderBanner)}
            </Slider>
        </Box>
    );
};

export default Carousel;