import { Grid, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getListRelatedProducts } from 'src/services/product';
import ProductCard from 'src/view/pages/product/components/ProductCard';
import { TProduct } from 'src/types/product';
import NoData from 'src/components/no-data';
import { useTranslation } from 'react-i18next';

interface RelatedProductProps {
    productId: number;
    initialData?: any[];
}

const RelatedProduct: React.FC<RelatedProductProps> = ({ productId, initialData }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const [relatedProducts, setRelatedProducts] = useState({
        data: [],
        total: 0
    });
    const [loading, setLoading] = useState(false);

    const handleGetListRelatedProduct = async () => {
        setLoading(true)
        const query = {
            params: {
                productId: productId,
                numberTop: 5
            },
        };
        await getListRelatedProducts(query).then((res) => {
            if (res?.result) {
                setLoading(false)
                setRelatedProducts({
                    data: res?.result,
                    total: res?.result?.length
                })
            }
        })
    }

    useEffect(() => {
        if (productId) {
            handleGetListRelatedProduct()
        }
    }, [productId])

    return (
        <Box sx={{
            backgroundColor: theme.palette.background.paper, width: '100%', height: '100%', maxWidth: '1440px !important', margin: '0 auto', py: 10,
            px: 8
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
                <Typography sx={{ textTransform: 'uppercase', cursor: 'pointer' }} variant="h3">{t('related_products')}</Typography>
            </Box>
            <Box>
                <Grid container spacing={{ md: 4, sx: 2 }}>
                    {relatedProducts?.data?.length > 0 ? (
                        <>
                            {relatedProducts?.data?.map((item: TProduct) => {
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

export default RelatedProduct
