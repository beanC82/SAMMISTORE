import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getBestSellingProducts } from 'src/services/product';
import ProductCard from 'src/view/pages/product/components/ProductCard';
import { TProduct } from 'src/types/product';
import NoData from 'src/components/no-data';
import { useTranslation } from 'react-i18next';

interface TopSaleProps {
    initialData?: any[];
}

const TopSale: React.FC<TopSaleProps> = ({ initialData }) => {

    const theme = useTheme();
    const { t } = useTranslation();

    const [publicProducts, setPublicProducts] = useState({
        data: [],
        total: 0
    });
    const [loading, setLoading] = useState(false);

    const handleGetListProduct = async () => {
        setLoading(true)
        await getBestSellingProducts({numberTop: 20, isPublic: true}).then((res) => {
            if (res?.result) {
                setLoading(false)
                setPublicProducts({
                    data: res?.result,
                    total: res?.result?.length
                })
            }
        })
    }

    useEffect(() => {
        handleGetListProduct()
    }, [])

    return (
        <Box sx={{ backgroundColor: theme.palette.background.paper, width: '100%', height: '100%', padding: '10px', marginTop: '20px', maxWidth: '1440px !important', margin: '0 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                    <Typography sx={{ textTransform: 'uppercase', cursor: 'pointer' }} variant="h3">Top 20 sản phẩm bán chạy</Typography>
                </Box>
            </Box>
            <Box>
                <Grid container spacing={{ md: 4, sx: 2 }}>
                    {loading ? (
                        Array.from(new Array(20)).map((_, index) => (
                            <Grid item key={index} md={2.4} sm={6} xs={12}>
                                <Skeleton variant="rectangular" height={200} />
                                <Skeleton />
                                <Skeleton width="60%" />
                            </Grid>
                        ))
                    ) : publicProducts?.data?.length > 0 ? (
                        <>
                            {publicProducts?.data?.map((item: TProduct) => {
                                return (
                                    <Grid item key={item.id} md={2.4} sm={6} xs={12}>
                                        <ProductCard item={item} />
                                    </Grid>
                                )
                            })}
                        </>
                    ) : (
                        <Box sx={{
                            padding: "20px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <NoData imageWidth="60px" imageHeight="60px" textNodata={t("no_data")} />
                        </Box>
                    )}
                </Grid>
            </Box>
        </Box>
    )
}

export default TopSale
