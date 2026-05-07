import React, { useMemo, lazy, Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { styled, useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'src/components/Icon';
import { Box, Fab, LinearProgress, Rating, Tooltip, ButtonGroup, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TProduct } from 'src/types/product';
import { useRouter } from 'next/router';
import { ROUTE_CONFIG } from 'src/configs/route';
import { formatPrice, isExpired } from 'src/utils';
import { AppDispatch, RootState } from 'src/stores';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from 'src/hooks/useAuth';
import { likeProductAsync, unlikeProductAsync } from 'src/stores/product/action';
import { toast } from 'react-toastify';
import { createCartAsync, getCartsAsync } from 'src/stores/cart/action';
import { likeProduct, unlikeProduct } from 'src/services/product';
// Dynamic imports for heavy components
const ProductCardSkeleton = dynamic(() => import('./ProductCardSkeleton'), {
    loading: () => <Skeleton variant="rectangular" width="100%" height={400} />,
    ssr: false
});

interface TProductCard {
    item: TProduct
    isLoading?: boolean,
    showProgress?: boolean
}

const StyledCard = styled(Card)(({ theme }) => ({
    position: "relative",
    overflow: "hidden",
    width: "100%",
    ".MuiCardMedia-root.MuiCardMedia-media": {
        objectFit: "contain"
    },
    "&:hover .button-group": {
        opacity: 1,
        visibility: "visible",
        right: 8,
        top: 8
    },
    "&:hover": {
        // boxShadow: theme.shadows[10],
        border: `2px solid ${theme.palette.customColors.borderColor}`,
    },
}));

const ButtonGroupWrapper = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: -100,
    right: -100,
    opacity: 0,
    visibility: "hidden",
    transition: "all 0.3s ease",
}));

const ProductCard: React.FC<TProductCard> = (props: any) => {

    const { item, isLoading = false, showProgress = false } = props

    const [isLiked, setIsLiked] = useState(item?.isLiked)

    //hooks
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const { user } = useAuth()

    //redux
    const dispatch: AppDispatch = useDispatch()
    const { carts, isSuccessCreate, isErrorCreate, errorMessageCreate } = useSelector((state: RootState) => state.cart)

    //handler
    const handleNavigateProductDetail = (id: number) => {
        router.push(`${ROUTE_CONFIG.PRODUCT}/${id}`)
    }


    const handleAddProductToCart = (item: TProduct) => {
        if (user?.id) {
            dispatch(
                createCartAsync({
                    cartId: 0,
                    productId: item.id,
                    quantity: 1,
                    operation: 0,
                })
            ).then((res) => {
                if(res.payload.isSuccess) {
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

    const handleToggleFavoriteProduct = async (id: number, isLiked: boolean) => {
        if (user?.id) {
            try {
                let response;

                if (isLiked) {
                    response = await unlikeProduct(id);
                    if (response?.isSuccess) {
                        setIsLiked(false);
                        toast.success(t('remove_from_wishlist_success'));
                    } else {
                        toast.error(response?.message || t('remove_from_wishlist_error'));
                    }
                } else {
                    response = await likeProduct(id);
                    if (response?.isSuccess) {
                        setIsLiked(true);
                        toast.success(t('add_to_wishlist_success'));
                    } else {
                        toast.error(response?.message || t('add_to_wishlist_error'));
                    }
                }
            } catch (error) {
                console.error("Error toggling product like status:", error);
                toast.error(t('common_error_message') || 'An unexpected error occurred.');
            }
        } else {
            router.replace({
                pathname: '/login',
                query: {
                    returnUrl: router.asPath
                }
            })
        }
    }

    const memoCheckExpire = useMemo(() => {
        if (item.startDate && item.endDate) {
            return isExpired(item.startDate, item.endDate);
        }
        return false;
    }, [item]);

    const soldPercentage = useMemo(() => {
        if (item.stockQuantity === 0) return 100;
        return ((item.sold || 0) / (item.stockQuantity + (item.sold || 0))) * 100;
    }, [item]);

    const progressColor = useMemo(() => {
        if (item.stockQuantity === 0) return 'error';
        if (item.stockQuantity <= 10) return 'warning';
        return 'primary';
    }, [item]);

    const statusText = useMemo(() => {
        if (item.stockQuantity === 0) return t('out_of_stock');
        if (item.stockQuantity <= 10) return t('selling_fast');
        return t('product_sold', { count: item.totalSold || 0 });
    }, [item, t]);

    if (isLoading) {
        return <ProductCardSkeleton />;
    }

    return (
        <StyledCard sx={{ width: "100%", boxShadow: "none" }}>
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    className="card-media"
                    component="img"
                    image={item?.images?.[0]?.imageUrl}
                    alt="product image"
                    sx={{
                        height: { xs: '180px', sm: '220px', md: '260px', lg: '300px' },
                        width: '100%',
                        objectFit: 'contain',
                        transition: "transform 0.3s ease",
                        "&:hover": {
                            transform: "scale(0.95)",
                        },
                    }}
                />
                {item?.discount > 0 && memoCheckExpire && (
                    <Box sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        backgroundColor: 'yellow',
                        width: { xs: "40px", sm: "45px" },
                        height: { xs: "40px", sm: "45px" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        zIndex: 1
                    }}>
                        <Typography variant="h6" sx={{
                            color: theme.palette.error.main,
                            fontWeight: 600,
                            fontSize: { xs: "12px", sm: "14px" },
                            lineHeight: "1",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            {Math.ceil(-(item?.discount * 100))}%
                        </Typography>
                    </Box>
                )}
            </Box>
            <ButtonGroupWrapper className="button-group">
                <ButtonGroup orientation="vertical" aria-label="Vertical button group"
                    sx={{
                        gap: 2,
                        position: "absolute",
                        top: 2,
                        right: 2
                    }}>
                    <Tooltip title={t("add_to_cart")}>
                        <Fab aria-label="add"
                            disabled={item.stockQuantity === 0}
                            sx={{ backgroundColor: theme.palette.common.white }}>
                            <IconButton onClick={() => handleAddProductToCart(item)}
                                sx={{
                                    '&.Mui-disabled': {
                                        color: theme.palette.grey[400],
                                        '& .MuiSvgIcon-root': {
                                            color: theme.palette.grey[400]
                                        }
                                    }
                                }}>
                                <IconifyIcon color={theme.palette.primary.main}
                                    icon="bi:cart-plus" fontSize='1.5rem' />
                            </IconButton>
                        </Fab>
                    </Tooltip>
                    <Tooltip title={t("see_product_detail")}>
                        <Fab aria-label="see-detail" sx={{ backgroundColor: theme.palette.common.white }}>
                            <IconButton onClick={() => handleNavigateProductDetail(+item?.id || 0)}>
                                <IconifyIcon color={theme.palette.primary.main} icon="famicons:eye-outline" fontSize='1.5rem' />
                            </IconButton>
                        </Fab>
                    </Tooltip>
                    <Tooltip title={t("add_to_wishlist")}>
                        <Fab aria-label="add-to-fav" sx={{ backgroundColor: theme.palette.common.white }}>
                            <IconButton onClick={() => handleToggleFavoriteProduct(item?.id, isLiked)}
                                aria-label="add to favorites">
                                {isLiked ? (
                                    <IconifyIcon icon="mdi:heart" color={theme.palette.primary.main} fontSize='1.5rem' />
                                ) : (
                                    <IconifyIcon icon="mdi:heart-outline" color={theme.palette.primary.main} fontSize='1.5rem' />
                                )}
                            </IconButton>
                        </Fab>
                    </Tooltip>
                </ButtonGroup>
            </ButtonGroupWrapper>
            <CardContent sx={{ padding: "8px 12px 0px 12px", pb: "10px !important", }}>
                <Typography variant="h5" onClick={() => handleNavigateProductDetail(+item?.id)}
                    sx={{
                        color: theme.palette.primary.main,
                        fontWeight: "bold",
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        "WebkitLineClamp": "2",
                        "WebkitBoxOrient": "vertical",
                        minHeight: { xs: "40px", sm: "48px" },
                        mt: 2
                    }}>
                    {item?.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: 1, mb: 1 }}>
                    <Rating defaultValue={item?.averageRating}
                        precision={0.1}
                        size='medium'
                        name='read-only'
                        readOnly
                        sx={{
                            '& .MuiRating-icon': {
                                color: 'gold',
                            },
                        }} />
                    <Typography>
                        {!!item?.totalReviews ? (
                            <b>{item?.totalReviews} {t("product_reviews")}</b>
                        ) : (
                            <span>{t("no_review")}</span>
                        )}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Typography variant="h4" sx={{
                        color: theme.palette.primary.main,
                        fontWeight: "bold",
                        fontSize: { xs: "16px", sm: "18px", md: "20px" }
                    }}>
                        {item?.discount > 0 && memoCheckExpire ? (
                            <>
                                {formatPrice(item?.newPrice)}
                            </>
                        ) : (
                            <>
                                {formatPrice(item?.price)}
                            </>
                        )}
                    </Typography>
                    {item?.discount > 0 && memoCheckExpire && (
                        <Typography variant="h6" sx={{
                            color: theme.palette.error.main,
                            fontWeight: "bold",
                            textDecoration: "line-through",
                            fontSize: "14px"
                        }}>
                            {formatPrice(item?.price)}
                        </Typography>
                    )}
                </Box>
                {
                    showProgress && (
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <Box sx={{
                                display: "flex",
                                width: "100%",
                                flexDirection: "column",
                                gap: "4px",
                                alignItems: "flex-start",
                                justifyContent: "center"
                            }}>
                                <Box sx={{ width: "100%", mt: 1, position: 'relative' }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={soldPercentage}
                                        color={progressColor}
                                        sx={{
                                            height: 18, borderRadius: 6, width: '100%',
                                            backgroundColor: '#fedfe2',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundImage: 'linear-gradient(to right, #d82e4d, #ff7f8e)',
                                                borderRadius: 6,
                                            }
                                        }}
                                    />
                                    <Typography variant="body2"
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            textWrap: 'nowrap',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            color: progressColor === 'error' ? theme.palette.error.main : progressColor === 'warning' ? theme.palette.warning.main : theme.palette.text.primary,
                                            textShadow: '0px 0px 2px rgba(255, 255, 255, 0.8)',
                                            fontWeight: 'bold'
                                        }}>
                                        {statusText}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )
                }

            </CardContent>
        </StyledCard>
    )
}

export default React.memo(ProductCard)