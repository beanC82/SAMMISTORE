import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'src/components/Icon';
import { Box, Fab, LinearProgress, Rating, Tooltip, ButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { ROUTE_CONFIG } from 'src/configs/route';
import { formatPrice } from 'src/utils';
import { useAuth } from 'src/hooks/useAuth';
import { likeProduct, unlikeProduct } from 'src/services/product';
import { toast } from 'react-toastify';

// Define the type for the liked product data
export type TMyLikedProduct = {
  customerId: number;
  productId: number;
  productName: string | null;
  productImage: string | null;
  price: number | null;
  newPrice: number | null;
  stockQuantity: number | null;
  id: number;
  createdDate: string;
  updatedDate: string | null;
  createdBy: string;
  updatedBy: string | null;
  isActive: boolean;
  isDeleted: boolean;
  displayOrder: number | null;
};

interface MyProductCardProps {
  item: TMyLikedProduct;
  onProductUnliked?: () => void; // Callback to refresh the list
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

const MyProductCard: React.FC<MyProductCardProps> = ({ item, onProductUnliked }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(true);

  const handleNavigateProductDetail = (id: number) => {
    router.push(`${ROUTE_CONFIG.PRODUCT}/${id}`);
  };

  const handleToggleFavoriteProduct = async (id: number) => {
    if (user?.id) {
      try {
        let response;
        if (isLiked) {
          response = await unlikeProduct(id);
          if (response?.isSuccess) {
            setIsLiked(false);
            toast.success(t('remove_from_wishlist_success'));
            // Call the callback to refresh the list
            onProductUnliked?.();
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
      });
    }
  };

  const soldPercentage = item.stockQuantity === 0 ? 100 : 0;
  const progressColor = item.stockQuantity === 0 ? 'error' : 'primary';
  const statusText = item.stockQuantity === 0 ? t('out_of_stock') : t('in_stock');

  return (
    <StyledCard sx={{ width: "100%", boxShadow: "none" }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          className="card-media"
          component="img"
          image={item.productImage || ''}
          alt={item.productName || 'product image'}
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
        {item.newPrice && item.price && item.newPrice < item.price && (
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
              {Math.ceil(-((item.newPrice - item.price) / item.price * 100))}%
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
          <Tooltip title={t("see_product_detail")}>
            <Fab aria-label="see-detail" sx={{ backgroundColor: theme.palette.common.white }}>
              <IconButton onClick={() => handleNavigateProductDetail(item.productId)}>
                <IconifyIcon color={theme.palette.primary.main} icon="famicons:eye-outline" fontSize='1.5rem' />
              </IconButton>
            </Fab>
          </Tooltip>
          <Tooltip title={isLiked ? t("remove_from_wishlist") : t("add_to_wishlist")}>
            <Fab aria-label="toggle-fav" sx={{ backgroundColor: theme.palette.common.white }}>
              <IconButton onClick={() => handleToggleFavoriteProduct(item.productId)}
                aria-label="toggle favorites">
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
      <CardContent sx={{ padding: "8px 12px 0px 12px", pb: "10px !important" }}>
        <Typography variant="h5" onClick={() => handleNavigateProductDetail(item.productId)}
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
          {item.productName}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: 1, mb: 1 }}>
          <Rating defaultValue={0} precision={0.1} size='medium' name='read-only' readOnly
            sx={{
              '& .MuiRating-icon': {
                color: 'gold',
              },
            }} />
          <Typography>
            <span>{t("no_review")}</span>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography variant="h4" sx={{
            color: theme.palette.primary.main,
            fontWeight: "bold",
            fontSize: { xs: "16px", sm: "18px", md: "20px" }
          }}>
            {item.newPrice && item.price && item.newPrice < item.price ? (
              formatPrice(item.newPrice)
            ) : (
              formatPrice(item.price || 0)
            )}
          </Typography>
          {item.newPrice && item.price && item.newPrice < item.price && (
            <Typography variant="h6" sx={{
              color: theme.palette.error.main,
              fontWeight: "bold",
              textDecoration: "line-through",
              fontSize: "14px"
            }}>
              {formatPrice(item.price)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(MyProductCard);
