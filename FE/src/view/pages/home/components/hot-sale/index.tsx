import { Grid, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CountdownTimer from './CountdownTimer';
import { getAllProducts, getEndowProducts } from 'src/services/product';
import ProductCard from 'src/view/pages/product/components/ProductCard';
import { TProduct } from 'src/types/product';
import NoData from 'src/components/no-data';
import { useTranslation } from 'react-i18next';

interface HotSaleProps {
    initialData?: any[];
}

const HotSale: React.FC<HotSaleProps> = ({ initialData }) => {

    const theme = useTheme();
    const { t } = useTranslation();

    const saleEndTime = '2025-05-26T23:59:59';
    const [publicProducts, setPublicProducts] = useState({
        data: [],
        total: 0
    });
    const [loading, setLoading] = useState(false);

    const handleGetListProduct = async () => {
        setLoading(true)
        try {
            const res = await getEndowProducts({ numberTop: 20, isPublic: true });
            if (res?.result) {
                setPublicProducts({
                    data: res.result,
                    total: res.result.length
                })
            } else {
                 setPublicProducts({ data: [], total: 0 })
            }
        } catch (error) {
            console.error("Failed to fetch endow products:", error);
            setPublicProducts({ data: [], total: 0 }) // Reset on error
        } finally {
            setLoading(false) // Ensure loading is set to false in both success and error cases
        }
    }

    useEffect(() => {
        handleGetListProduct()
    }, [])

    const skeletonCount = 20; // Match the numberTop parameter in getEndowProducts

    return (
        <Box sx={{ backgroundColor: theme.palette.secondary.main, width: '100%', height: '100%', padding: '10px' }}>
            <Box sx={{ width: '100%', backgroundColor: theme.palette.background.paper, maxWidth: '1440px', margin: '0 auto', borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                        <Typography sx={{ textTransform: 'uppercase', cursor: 'pointer' }} variant="h3">Ưu đãi hot, đừng bỏ lỡ!!</Typography>
                        <Typography>Sản phẩm sẽ trở về giá gốc khi hết giờ</Typography>
                    </Box>
                    <Box>
                        <CountdownTimer saleEndTime={saleEndTime} />
                    </Box>
                </Box>
                <Box sx={{ padding: '10px' }}>
                    <Grid container spacing={{ md: 4, sm: 3, xs: 2 }}>
                        {loading ? (
                             // Render skeletons based on the expected count
                            Array.from(new Array(skeletonCount)).map((_, index) => (
                                <Grid item key={index} md={2.4} sm={4} xs={12}>
                                    <ProductCard item={{} as TProduct} isLoading={true} />
                                </Grid>
                            ))
                        ) : publicProducts?.data?.length > 0 ? (
                            <>
                                {publicProducts?.data?.map((item: TProduct) => {
                                    return (
                                        <Grid item key={item.id} md={2.4} sm={4} xs={12}>
                                            <ProductCard item={item} showProgress={true} />
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
        </Box>
    )
}

export default HotSale
