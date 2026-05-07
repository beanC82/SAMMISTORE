import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import IconifyIcon from 'src/components/Icon';
import Slider from 'react-slick';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getOutstandingBrand } from 'src/services/brand';


interface ArrowProps {
    onClick?: () => void;
    className?: string; // Add className for slick styling
}

const NextArrow: FC<ArrowProps> = memo(({ onClick, className }) => (
    <IconButton
        onClick={onClick}
        className={className} // Pass className
        sx={{
            position: "absolute",
            right: "-25px", // Adjust position
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(0, 0, 0, 0.5)", // Style as per image
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: 40,
            height: 40,
            '&:hover': {
                color: "rgba(0, 0, 0, 1)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
            },
            // Hide if className indicates disabled (from slick)
             '&.slick-disabled': {
                 display: 'none',
             },
        }}
    >
        <IconifyIcon icon="lucide:chevron-right" fontSize="1.5rem" />
    </IconButton>
));

const PrevArrow: FC<ArrowProps> = memo(({ onClick, className }) => (
     <IconButton
        onClick={onClick}
        className={className} // Pass className
        sx={{
            position: "absolute",
            left: "-25px", // Adjust position
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(0, 0, 0, 0.5)", // Style as per image
            backgroundColor: "rgba(255, 255, 255, 0.5)",
             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
             width: 40,
             height: 40,
            '&:hover': {
                color: "rgba(0, 0, 0, 1)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
            },
            // Hide if className indicates disabled (from slick)
             '&.slick-disabled': {
                 display: 'none',
             },
        }}
    >
        <IconifyIcon icon="lucide:chevron-left" fontSize="1.5rem" />
    </IconButton>
));

const OutstandingBrand: FC = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     // Fetch data on mount
     useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getOutstandingBrand({numberTop: 20, isPublic: true});
                if (response?.isSuccess && response?.result) {
                    setBrands(response.result);
                } else {
                     setError(response?.message || 'Failed to fetch brands');
                     console.error("API Error:", response);
                }
            } catch (err: any) {
                setError(err?.message || 'An error occurred');
                 console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const settings = useMemo(() => ({
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 6,
        slidesToScroll: 1,
        autoplay: true,
        cssEase: 'linear',
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        swipe: true,
        draggable: true,
        responsive: [
             {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                     arrows: false, // Hide arrows on smaller screens
                },
            },
             {
                breakpoint: 576,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                     arrows: false,
                },
            },
        ],
    }), []);

     if (loading) {

        const initialSlidesToShow = settings.slidesToShow;
         return (
             <Box sx={{ my: 8, paddingX: { xs: 2, sm: 3, md: 5 } }}>

                 <Box sx={{ display: 'flex', flexDirection: 'column', padding: '30px', alignItems: 'flex-start' }}>
                     <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
                 </Box>

                 <Box sx={{ position: 'relative', paddingX: { xs: 0, sm: 4, md: 5 } }}>
                     <Grid container spacing={2} justifyContent="center">
                        {[...Array(initialSlidesToShow)].map((_, index) => ( 
                             <Grid item key={index} xs={4} sm={3} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                                 <Skeleton variant="rectangular" width={150} height={80} />
                             </Grid>
                         ))}
                     </Grid>
                 </Box>
             </Box>
         );
     }

     if (error) {
         return <Typography color="error">Could not load brands: {error}</Typography>;
     }

     if (brands.length === 0) {
          return null;
     }


    return (
        <Box sx={{ my: 8, paddingX: { xs: 2, sm: 3, md: 5 } }}>
             <Box sx={{ display: 'flex', flexDirection: 'column', padding: '30px' }}>
                    <Typography sx={{ textTransform: 'uppercase', cursor: 'pointer' }} variant="h3">{t('outstanding_brands')}</Typography>
                </Box>

             <Box sx={{ position: 'relative', paddingX: { xs: 0, sm: 4, md: 5 } }}>
                 <Slider {...settings}>
                    {brands.map((brand) => (
                         <Box
                            key={brand.id}
                            sx={{
                                display: 'flex !important',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '180px',
                                padding: 1,
                                outline: 'none',
                            }}
                         >
                             <Link href={`/brands/${brand.code}`} passHref>
                                 <Box
                                     component="a"
                                     sx={{
                                         display: 'flex',
                                         justifyContent: 'center',
                                         alignItems: 'center',
                                         height: '100%',
                                         width: '100%',
                                         filter: 'grayscale(100%)',
                                         transition: 'filter 0.3s ease',
                                         '&:hover': {
                                             filter: 'grayscale(0%)',
                                         }
                                     }}
                                 >
                                     <Image
                                        src={brand.imageUrl}
                                        alt={brand.name}
                                        width={150}
                                        height={80}
                                        style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                 </Box>
                             </Link>
                         </Box>
                    ))}
                </Slider>
             </Box>
        </Box>
    );
};


export default memo(OutstandingBrand);
