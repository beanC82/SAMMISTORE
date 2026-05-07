import React, { useMemo } from 'react';
import Image from 'next/image';
import { Box, Typography, Card, CardContent, Grid, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Category1 from '/public/images/cate1.png';
import Category2 from '/public/images/cate2.png';
import Category3 from '/public/images/cate3.png';
import Category4 from '/public/images/cate4.png';
import Category5 from '/public/images/cate5.png';
import Category6 from '/public/images/cate6.png';
import Category7 from '/public/images/cate7.png';
import Category8 from '/public/images/cate8.png';
import Category9 from '/public/images/cate9.png';
import Category10 from '/public/images/cate10.png';

import { StaticImageData } from 'next/image';

interface TCategory {
    id: number;
    title: string;
    image: StaticImageData;
}

const useCategories = () => {
    return useMemo(() => [
        { id: 1, title: 'Tẩy trang', image: Category1 },
        { id: 2, title: 'Sữa rửa mặt', image: Category2 },
        { id: 3, title: 'Mặt nạ', image: Category3 },
        { id: 4, title: 'Nước hoa hồng', image: Category4 },
        { id: 5, title: 'Tinh chất', image: Category5 },
        { id: 6, title: 'Dưỡng ẩm', image: Category6 },
        { id: 7, title: 'Dưỡng thể', image: Category7 },
        { id: 8, title: 'Trang điểm', image: Category8 },
        { id: 9, title: 'Chăm sóc tóc', image: Category9 },
        { id: 10, title: 'Nước hoa', image: Category10 },
    ], []);
};

export interface OutstandingCategoryProps {
    initialData?: any[];
}

const OutstandingCategory: React.FC<OutstandingCategoryProps> = ({ initialData }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const categories = useCategories();

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.6 },
        visible: { opacity: 1, scale: 1 }
    };

    const cardVariants = {
        hover: {
            scale: 1.1,
            x: [-5, 5, -5, 5, 0],
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 10,
                duration: 0.5,
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={containerVariants}
            transition={{ duration: 2 }}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    maxWidth: '1440px',
                    pt: 10,
                    margin: '0 auto',
                    pb: '1.2rem',
                    backgroundColor: theme.palette.background.paper
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    align="left"
                    sx={{
                        fontWeight: 'bold',
                        mb: '1.6rem',
                        ml: '15px',
                        textTransform: 'uppercase',
                        fontFamily: 'Yeseva One'
                    }}
                >
                    {t('outstanding_category')}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        justifyContent: 'center',
                        width: '100%',
                        flex: 1
                    }}
                >
                    {categories.map((category: TCategory) => (
                        <Box
                            key={category.id}
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <motion.div
                                whileHover="hover"
                                variants={cardVariants}
                                className='w-full h-full'
                            >
                                <Card
                                    sx={{
                                        width: '100%',
                                        maxWidth: '114px',
                                        margin: 'auto',
                                        cursor: 'pointer',
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none'
                                    }}
                                >
                                    <Box sx={{ position: 'relative', width: '100%', height: '91px' }}>
                                        <Image
                                            src={category.image}
                                            alt={category.title}
                                            fill
                                            sizes="114px"
                                            style={{ objectFit: 'contain' }}
                                            priority={category.id <= 3}
                                            className='object-contain object-center w-[114px] h-[50px]'
                                        />
                                    </Box>
                                    <CardContent sx={{ padding: 0, pb: '0 !important' }}>
                                        <Typography
                                            gutterBottom
                                            variant="h6"
                                            sx={{
                                                width: '100%',
                                                padding: 0,
                                                mt: '12px',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                fontFamily: 'Roboto, sans-serif',
                                                textWrap: 'nowrap',
                                                "&:hover": {
                                                    color: theme.palette.primary.main
                                                }
                                            }}
                                        >
                                            {category.title}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Box>
                    ))}
                </Box>
            </Box>
        </motion.div>
    );
};

export default OutstandingCategory;