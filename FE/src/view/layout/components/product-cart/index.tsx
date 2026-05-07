// React
import React, { useEffect, useMemo, useState, Suspense } from "react"
import dynamic from 'next/dynamic'

// Next
import { useRouter } from "next/navigation";

// MUI Imports - Optimized individual imports
import Avatar from "@mui/material/Avatar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { MenuItemProps } from "@mui/material"
import { styled } from "@mui/material/styles"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { useTheme } from "@mui/material/styles"

// Dynamic imports
const IconifyIcon = dynamic(() => import("../../../../components/Icon"), {
  ssr: false,
  loading: () => <Spinner />
})

const NoData = dynamic(() => import("src/components/no-data"), {
  ssr: false
})

// Hooks
import { useAuth } from "src/hooks/useAuth";

// Translate
import { useTranslation } from "react-i18next";

// Utils
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "src/stores";
import { formatPrice } from "src/utils";
import { ROUTE_CONFIG } from "src/configs/route";
import { getProductDetail } from "src/services/product";
import { getCartsAsync } from "src/stores/cart/action";
import Link from "next/link";
import Spinner from "src/components/spinner";
type TProps = {}

const StyledMenuItem = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
}))

interface CartItem {
    cartId: number;
    productId: number;
    productName: string;
    price: number;
    newPrice: number;
    quantity: number;
    productImage: string;
    stockQuantity: number;
    id: number;
    createdDate: string;
    updatedDate: string | null;
    createdBy: string;
    updatedBy: string | null;
    isActive: boolean;
    isDeleted: boolean;
    displayOrder: number | null;
}

const ProductCart = (props: TProps) => {
    const { user } = useAuth()

    const { carts } = useSelector((state: RootState) => state.cart)
    const dispatch: AppDispatch = useDispatch()

    //Translation
    const { t, i18n } = useTranslation()
    const theme = useTheme()

    const router = useRouter()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    //handler
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNavigateProductDetail = (id: number) => {
        router.push(`${ROUTE_CONFIG.PRODUCT}/${id}`)
    }

    const totalItemsCart = useMemo(() => {
        if (!carts?.data) return 0;
        return carts.data.reduce((result: number, current: CartItem) => {
            return result + current.quantity;
        }, 0);
    }, [carts]);

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

    const renderCartItems = useMemo(() => {
        if (!carts?.data?.length) {
            return (
                <Box sx={{
                    padding: "20px",
                    width: "fit-content",
                }}>
                    <Suspense fallback={<Spinner />}>
                        <NoData imageWidth="60px" imageHeight="60px" textNodata={t("empty_cart")} />
                    </Suspense>
                </Box>
            );
        }

        return (
            <Box sx={{ maxHeight: "300px", maxWidth: "300px", overflow: "auto" }}>
                {carts?.data?.map((item: CartItem) => (
                    <StyledMenuItem 
                        key={item.productId} 
                        onClick={() => handleNavigateProductDetail(item.productId)}
                    >
                        <Avatar src={item.productImage} />
                        <Box sx={{ ml: 1 }}>
                            <Typography sx={{ textWrap: "wrap", fontSize: "13px" }}>{item?.productName}</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Typography variant="h4" sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: "bold",
                                    fontSize: "12px"
                                }}>
                                    {formatPrice(item.newPrice)}
                                </Typography>
                                {item.price !== item.newPrice && (
                                    <Typography variant="h6" sx={{
                                        color: theme.palette.error.main,
                                        fontWeight: "bold",
                                        textDecoration: "line-through",
                                        fontSize: "10px"
                                    }}>
                                        {formatPrice(item.price)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Typography sx={{ textWrap: "wrap", fontSize: "13px", fontWeight: 600, ml: 2 }}>
                            x{item?.quantity}
                        </Typography>
                    </StyledMenuItem>
                ))}
                <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", padding: '0 20px' }}>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth
                        sx={{ mt: 3, mb: 2, py: 1.5, mr: 2, borderRadius: "8px" }}
                    >
                        <Link href={`${ROUTE_CONFIG.MY_CART}`}>
                            {t('view_cart')}
                        </Link>
                    </Button>
                </Box>
            </Box>
        );
    }, [carts?.data, theme, t, handleNavigateProductDetail]);

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title={t("cart")}>
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        color="inherit"
                        aria-controls={open ? 'product-cart' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Suspense fallback={<Spinner />}>
                            {!!carts?.data?.length ? (
                                <Badge color="primary" badgeContent={totalItemsCart}>
                                    <IconifyIcon icon="flowbite:cart-outline" />
                                </Badge>
                            ) : (
                                <IconifyIcon icon="flowbite:cart-outline" />
                            )}
                        </Suspense>
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {renderCartItems}
            </Menu>
        </React.Fragment>
    )
}

export default ProductCart
