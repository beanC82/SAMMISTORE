"use client"

// React & Next Imports
import React, { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { NextPage } from 'next'
import { useRouter } from 'next/router'

// Material UI Component Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'

// Dynamic Imports for Code Splitting
const Spinner = dynamic(() => import('src/components/spinner'), { ssr: false })
const CustomTextField = dynamic(() => import('src/components/text-field'), { ssr: false })
const IconifyIcon = dynamic(() => import('src/components/Icon'), { ssr: false })
const CustomBreadcrumbs = dynamic(() => import('src/components/custom-breadcrum'), { ssr: false })
const ReviewCard = dynamic(() => import('../components/ReviewCard'), { ssr: false })
const Image = dynamic(() => import('src/components/image'), { ssr: false })

// Service & API Imports
import { getListRelatedProductBySlug, getPublicProductDetail } from 'src/services/product'

// Type Imports
import { TProduct } from 'src/types/product'
import { TReviewItem } from 'src/types/review'

// Store & Redux Imports
import { AppDispatch, RootState } from 'src/stores'
import { createCartAsync, getCartsAsync } from 'src/stores/cart/action'


// Utils & Helpers Imports
import { useAuth } from 'src/hooks/useAuth'
import { hexToRGBA } from 'src/utils/hex-to-rgba'
import { formatPrice, isExpired } from 'src/utils'
import { ROUTE_CONFIG } from 'src/configs/route'
import RelatedProduct from './RelatedProduct'
import ProductReview from './ProductReview'

// Constants
const INITIAL_PRODUCT_STATE: TProduct = {
    id: 0,
    code: '',
    name: '',
    stockQuantity: 0,
    price: 0,
    ingredient: '',
    uses: '',
    discount: 0,
    usageGuide: '',
    brandId: 0,
    categoryId: 0,
    status: 0,
    isLiked: false,
    images: [{
        id: 0,
        imageUrl: '',
        imageBase64: '',
        value: '',
        publicId: '',
        typeImage: '',
        displayOrder: 0
    }]
}

// Define or update the props interface
interface ProductDetailPageProps {
}

const ProductDetailPage: NextPage<ProductDetailPageProps> = () => {
    // State Management
    const [loading, setLoading] = useState<boolean>(false)
    const [productData, setProductData] = useState<TProduct>({} as TProduct)
    const [listRelatedProduct, setListRelatedProduct] = useState<TProduct[]>([])
    const [productAmount, setProductAmount] = useState<number>(1)
    const [activeTab, setActiveTab] = useState(0)
    const [selectedImage, setSelectedImage] = useState(0)
    const [showZoom, setShowZoom] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [averageRating, setAverageRating] = useState<number>(0)
    const [totalRatings, setTotalRatings] = useState<number>(0)

    // Hooks & Context
    const router = useRouter()
    const { user } = useAuth()
    const { i18n } = useTranslation()
    const theme = useTheme()
    const dispatch: AppDispatch = useDispatch()

    // Redux State
    const { carts, isSuccessCreate, isErrorCreate, errorMessageCreate } = useSelector((state: RootState) => state.cart)


    // Computed Values
    const productId = Number(router.query.productId) || 0

    const breadcrumbItems = [
        { label: t('home'), href: '/', icon: <IconifyIcon color='primary' icon='healthicons:home-outline' /> },
        { label: t('product_detail'), href: '/product' },
        { label: productData?.name || t('product'), href: `/product/${productId}` },
    ]

    // Memoized Values
    const memoCheckExpire = useMemo(() => {
        if (productData.startDate && productData.endDate) {
            return isExpired(productData.startDate, productData.endDate)
        }
    }, [productData])

    //fetch api
    const fetchGetProductDetail = async (id: number) => {
        setLoading(true)
        await getPublicProductDetail(id)
            .then(async response => {
                setLoading(false)
                const data = response?.result
                if (data) {
                    setProductData(data)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }


    //handler
    const handleAddProductToCart = (item: TProduct) => {
        if (user?.id) {
            dispatch(
                createCartAsync({
                    cartId: 0,
                    productId: item.id,
                    quantity: productAmount,
                    operation: 0,
                })
            ).then((res) => {
                if (res?.payload?.isSuccess) {
                    toast.success(t('add_to_cart_success'))
                    dispatch(
                        getCartsAsync({
                            params: {
                                take: -1,
                                skip: 0,
                                paging: false,
                                orderBy: 'name',
                                dir: 'asc',
                                keywords: "''",
                                filters: '',
                            },
                        })
                    );
                } else {
                    toast.error(errorMessageCreate)
                }
            })
        } else {
            router.replace({
                pathname: '/login',
                query: {
                    returnUrl: router.asPath
                }
            })
        }
    }

    const handleBuyNow = (item: TProduct) => {
        handleAddProductToCart(item)
        router.push({
            pathname: ROUTE_CONFIG.MY_CART,
            query: {
                selected: item.id,
            }
        }, ROUTE_CONFIG.MY_CART)
    }

    // Handler to receive rating data from ProductReview
    const handleRatingDataChange = (data: { averageRating: number; totalRating: number }) => {
        setAverageRating(data.averageRating);
        setTotalRatings(data.totalRating);
    };

    useEffect(() => {
        if (productId) {
            fetchGetProductDetail(productId)
            // fetchGetListRelatedProduct(productId)
        }
    }, [productId])

    useEffect(() => {
        if (user?.id) {
            dispatch(
                getCartsAsync({
                    params: {
                        take: -1,
                        skip: 0,
                        paging: false,
                        orderBy: 'name',
                        dir: 'asc',
                        keywords: "''",
                        filters: '',
                    },
                })
            );
        }
    }, [dispatch, user?.id]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleThumbnailClick = (index: number) => {
        setSelectedImage(index);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();

        // Calculate position relative to the container
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage position
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        setZoomPosition({ x: xPercent, y: yPercent });
    };

    return (
        <Box sx={{
            maxWidth: '1440px',
            margin: '0 auto',
            width: '100%',
            py: { xs: 2, sm: 1, md: 2, lg: 8 },
            px: { xs: 2, sm: 2, md: 4, lg: 8 },
        }}>
            {loading && <Spinner />}
            {/* Breadcrumbs */}
            <Box sx={{ mb: { xs: 1, sm: 2, md: 4 } }}>
                <CustomBreadcrumbs items={breadcrumbItems} />
            </Box>
            <Grid container spacing={3} sx={{
                padding: { xs: 4, sm: 4, md: 4, lg: 8 },
            }}>
                <Grid container item md={12} xs={12} sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: "15px",
                    py: 5, px: 4
                }} >
                    <Box sx={{
                        width: "100%",
                        height: "100%",
                    }}>
                        <Grid container spacing={5}>
                            <Grid item md={5} xs={12}>
                                <Stack sx={{
                                    gap: 2,
                                    justifyContent: 'center',
                                    flexDirection: { xs: 'row', md: 'row' },
                                    position: 'relative'
                                }}>
                                    <Stack sx={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        position: 'relative',
                                        width: { xs: '100%', md: '70%' },
                                        height: { xs: '300px', md: '350px' },
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        boxShadow: theme.shadows[2],
                                        mb: 2
                                    }}>
                                        {productData?.images?.length > 0 && (
                                            <Image
                                                src={productData.images[selectedImage]?.imageUrl}
                                                alt={productData?.name}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    cursor: 'crosshair'
                                                }}
                                                onMouseMove={handleMouseMove}
                                                onMouseEnter={() => setShowZoom(true)}
                                                onMouseLeave={() => setShowZoom(false)}
                                            />
                                        )}
                                    </Stack>
                                    {showZoom && productData?.images?.length > 0 && (
                                        <Box sx={{
                                            display: { xs: 'none', md: 'block' },
                                            position: 'absolute',
                                            width: '400px',
                                            height: '400px',
                                            borderRadius: '15px',
                                            overflow: 'hidden',
                                            boxShadow: theme.shadows[4],
                                            right: '-420px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 2,
                                            border: `1px solid ${theme.palette.divider}`,
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backgroundImage: `url(${productData.images[selectedImage]?.imageUrl})`,
                                                backgroundSize: '200%',
                                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                                backgroundRepeat: 'no-repeat',
                                                transition: 'background-position 0.1s ease'
                                            }} />
                                        </Box>
                                    )}
                                </Stack>
                                <Stack sx={{
                                    gap: 2,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    overflowX: 'auto',
                                    py: 1,
                                    '&::-webkit-scrollbar': {
                                        height: '4px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: theme.palette.grey[100],
                                        borderRadius: '4px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: theme.palette.grey[400],
                                        borderRadius: '4px',
                                    }
                                }}>
                                    {productData?.images?.length > 0 && productData.images.map((image, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: `2px solid ${selectedImage === index ? theme.palette.primary.main : 'transparent'}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                }
                                            }}
                                            onClick={() => handleThumbnailClick(index)}
                                        >
                                            <Image
                                                src={image.imageUrl}
                                                alt={`${productData?.name} - ${index + 1}`}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid item md={7} xs={12}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 2
                                }}>
                                    <Typography variant="h4"
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontWeight: "bold",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            "-webkitLineClamp": "2",
                                            "-webkitBoxOrient": "vertical"
                                        }}>
                                        {productData?.name}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 2
                                }}>
                                    <Rating
                                        value={averageRating || 0}
                                        readOnly
                                        precision={0.1}
                                        sx={{ color: theme.palette.warning.main }}
                                    />
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        ({totalRatings} {t('reviews')})
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mt: 3,
                                    borderRadius: "8px"
                                }}>
                                    <Typography variant="h4" sx={{
                                        color: theme.palette.primary.main,
                                        fontWeight: "bold",
                                        fontSize: { xs: "20px", md: "24px" }
                                    }}>
                                        {productData?.discount > 0 && memoCheckExpire ? (
                                            <>
                                                {formatPrice(productData?.price - (productData?.price * productData?.discount * 100 / 100))}
                                            </>
                                        ) : (
                                            <>
                                                {formatPrice(productData?.price)}
                                            </>
                                        )}
                                    </Typography>
                                    {productData?.discount > 0 && memoCheckExpire && (
                                        <>
                                            <Typography variant="h6" sx={{
                                                color: theme.palette.error.main,
                                                fontWeight: "bold",
                                                textDecoration: "line-through",
                                                fontSize: { xs: "14px", md: "18px" }
                                            }}>
                                                {formatPrice(productData?.price)}
                                            </Typography>
                                            <Box sx={{
                                                backgroundColor: hexToRGBA(theme.palette.error.main, 0.99),
                                                width: "fit-content",
                                                padding: "8px 12px",
                                                height: "24px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "12px"
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: theme.palette.common.white,
                                                    fontWeight: "bold",
                                                    fontSize: "12px",
                                                    lineHeight: "1.3",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    -{productData?.discount * 100}%
                                                </Typography>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: 'center',
                                    gap: 2,
                                    mt: 3
                                }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{t('quantity')}:</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconButton
                                            sx={{
                                                border: `1px solid ${theme.palette.customColors.borderColor}`,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.grey[100]
                                                }
                                            }}
                                            onClick={() => {
                                                if (productAmount > 1) {
                                                    setProductAmount((prev) => prev - 1)
                                                }
                                            }}
                                        >
                                            <IconifyIcon icon="eva:minus-fill" />
                                        </IconButton>
                                        <CustomTextField
                                            type='number'
                                            value={productAmount}
                                            InputProps={{
                                                inputMode: "numeric",
                                                inputProps: {
                                                    min: 1,
                                                    max: productData?.stockQuantity
                                                }
                                            }}
                                            onChange={(e) => {
                                                setProductAmount(+e.target.value);
                                            }}
                                            sx={{
                                                ".MuiInputBase-root.MuiFilledInput-root": {
                                                    width: "60px",
                                                    border: "none",
                                                },
                                                'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
                                                    WebkitAppearance: "none",
                                                    margin: 0
                                                },
                                                'input[type=number]': {
                                                    MozAppearance: "textfield"
                                                },
                                                input: {
                                                    padding: 0,
                                                    paddingLeft: "12px",
                                                    width: "30px"
                                                },
                                                fieldset: {
                                                    border: "none"
                                                }
                                            }}
                                        />
                                        <IconButton
                                            sx={{
                                                border: `1px solid ${theme.palette.customColors.borderColor}`,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.grey[100]
                                                }
                                            }}
                                            onClick={() => {
                                                if (productAmount < productData?.stockQuantity) {
                                                    setProductAmount((prev) => prev + 1)
                                                }
                                            }}
                                        >
                                            <IconifyIcon icon="ic:round-plus" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mt: 4,
                                    flexWrap: 'wrap'
                                }}>
                                    <Button
                                        variant="contained"
                                        color='error'
                                        disabled={productData?.stockQuantity === 0}
                                        onClick={() => handleAddProductToCart(productData)}
                                        startIcon={<IconifyIcon icon="bx:cart" />}
                                        sx={{
                                            height: "48px",
                                            px: 4,
                                            fontWeight: 600,
                                            flex: { xs: '1 1 100%', sm: '0 1 auto' }
                                        }}
                                    >
                                        {t('add_cart')}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        disabled={productData?.stockQuantity === 0}
                                        onClick={() => handleBuyNow(productData)}
                                        startIcon={<IconifyIcon icon="icon-park-outline:buy" />}
                                        sx={{
                                            height: "48px",
                                            px: 4,
                                            fontWeight: 600,
                                            flex: { xs: '1 1 100%', sm: '0 1 auto' }
                                        }}
                                    >
                                        {t('buy_now')}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                <Grid xs={12} sx={{ mt: 4 }}>
                    <Box sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "15px",
                        overflow: 'hidden'
                    }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                '& .MuiTab-root': {
                                    minWidth: { xs: 'auto', sm: 160 },
                                    textTransform: 'none',
                                    fontWeight: 600
                                }
                            }}
                        >
                            <Tab label={t("product_usage_guide")} />
                            <Tab label={t("product_uses")} />
                            <Tab label={t("product_ingredients")} />
                        </Tabs>

                        <Box sx={{ p: 4 }}>
                            {activeTab === 0 && (
                                <Box
                                    dangerouslySetInnerHTML={{ __html: productData?.usageGuide }}
                                    sx={{
                                        color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                                        fontSize: "16px",
                                        lineHeight: 1.8,
                                        '& p': { mb: 2 },
                                        '& ul, & ol': { pl: 4, mb: 2 }
                                    }}
                                />
                            )}
                            {activeTab === 1 && (
                                <Box
                                    dangerouslySetInnerHTML={{ __html: productData?.uses }}
                                    sx={{
                                        color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                                        fontSize: "16px",
                                        lineHeight: 1.8,
                                        '& p': { mb: 2 },
                                        '& ul, & ol': { pl: 4, mb: 2 }
                                    }}
                                />
                            )}
                            {activeTab === 2 && (
                                <Box
                                    dangerouslySetInnerHTML={{ __html: productData?.ingredient }}
                                    sx={{
                                        color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                                        fontSize: "16px",
                                        lineHeight: 1.8,
                                        '& p': { mb: 2 },
                                        '& ul, & ol': { pl: 4, mb: 2 }
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </Grid>

                {/* Reviews Section */}
                <Grid xs={12} sx={{ mt: 4 }}>
                    <ProductReview productId={productId} onRatingDataChange={handleRatingDataChange} />
                </Grid>

                <Grid xs={12} sx={{ mt: 4 }}>
                    <RelatedProduct productId={productId} />
                </Grid>
            </Grid>
        </Box>
    )
}

export default ProductDetailPage
