"use client"

//React
import React, { useEffect, useState } from 'react'

//Next
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useDebounce } from 'src/hooks/useDebounce'

//MUI
import { Box, Stack, useTheme } from '@mui/material'

//Configs
import { Grid } from '@mui/material'

//Translate
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

// ** Import API service instead
import { getMyLikedProduct } from 'src/services/product'

//Other
import { toast } from 'react-toastify'
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig'

// Dynamic imports
const Spinner = dynamic(() => import('src/components/spinner'), { ssr: false })
const SearchField = dynamic(() => import('src/components/search-field'), { ssr: false })
const NoData = dynamic(() => import('src/components/no-data'), { ssr: false })
const CustomPagination = dynamic(() => import('src/components/custom-pagination'), { ssr: false })
const MyProductCard = dynamic(() => import('src/view/pages/account/my-product/MyProductCard'), { ssr: false })

// Import the new type
import { TMyLikedProduct } from './MyProductCard'

type TProps = {}

const MyProductPage: NextPage<TProps> = () => {
    //hooks
    const { i18n, t } = useTranslation();

    //States
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [loading, setLoading] = useState<boolean>(false)
    const [searchBy, setSearchBy] = useState("");
    const [myLikedProducts, setMyLikedProducts] = useState<TMyLikedProduct[]>([]);
    const [totalItems, setTotalItems] = useState(0);

    //Theme
    const theme = useTheme();
    //Debounce Search
    const searchByDebounce = useDebounce(searchBy, 500)

    // ** Fetch My Liked Products using API service
    const fetchMyLikedProduct = async () => {
        setLoading(true);
        try {
            const response = await getMyLikedProduct({
                params: {
                    take: -1,
                    skip: 0,
                    paging: false,
                    orderBy: "name",
                    dir: "asc",
                    keywords: "''",
                    type: 4,
                    filters: ""
                }
            });
            if (response?.isSuccess) {
                const data = response?.result;
                const total = response?.result?.totalItemCount;
                setMyLikedProducts(data as TMyLikedProduct[] || []);
                setTotalItems(total || 0);
            }
        } catch (error) {
            // Handle error appropriately, maybe show a toast
            console.error("Error fetching liked products:", error);
            setMyLikedProducts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMyLikedProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, searchByDebounce]);

    //Handler
    const handleOnChangePagination = (page: number, pageSize: number) => {
        setPage(page)
        setPageSize(pageSize)
        setSearchBy("")
    }

    return (
        <>
            {loading && <Spinner />}
            <Box sx={{
                backgroundColor: theme.palette.background.paper,
                p: 4,
                borderRadius: '15px'
            }}>
                <Grid container item md={12} xs={12} sx={{
                    borderRadius: "15px",
                    py: 5, px: 4
                }} >
                    <Box sx={{ width: '100%', height: 'fit-content' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, width: '100%' }}>
                            <Box sx={{ width: '300px', mb: 2 }}>
                                <SearchField value={searchBy} placeholder={t('search_by_product_name')} onChange={(value: string) => setSearchBy(value)} />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Stack sx={{
                            padding: "20px",
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}>
                            {myLikedProducts.length > 0 ? (
                                <Grid container spacing={4}>
                                    {myLikedProducts.map((product) => (
                                        <Grid item key={product.id} md={3} sm={6} xs={12}>
                                            <MyProductCard item={product} onProductUnliked={fetchMyLikedProduct} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <NoData imageWidth="60px" imageHeight="60px" textNodata={t("no_data")} />
                            )}
                        </Stack>
                    </Box>
                </Grid>

            </Box>
        </>
    )
}

export default MyProductPage
