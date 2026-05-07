import React from 'react'
import { Box, Paper, Typography, Stack, useTheme } from '@mui/material'
import { useRouter } from 'next/router'
import { ROUTE_CONFIG } from 'src/configs/route'
import { formatPrice } from 'src/utils'
import { TProduct } from 'src/types/product'

type TProps = {
  product: TProduct
}

const ProductSuggestChat = ({ product }: TProps) => {
  const theme = useTheme()
  const router = useRouter()

  const handleNavigateProductDetail = () => {
    router.push(`${ROUTE_CONFIG.PRODUCT}/${product.id}`)
  }

  return (
    <Paper
      elevation={0}
      onClick={handleNavigateProductDetail}
      sx={{
        width: 140,
        minWidth: 140,
        cursor: 'pointer',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[2],
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Ảnh sản phẩm */}
      <Box sx={{ position: 'relative', pt: '100%', bgcolor: 'white' }}>
        <img
          src={product.images?.[0]?.imageUrl || '/images/avatars/default-product.png'}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '8px',
          }}
        />
        {product.discount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 5,
              right: 5,
              bgcolor: 'error.main',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              px: 1,
              py: 0.2,
              borderRadius: 1,
            }}
          >
            -{Math.round(product.discount * 100)}%
          </Box>
        )}
      </Box>

      {/* Thông tin */}
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '32px',
            lineHeight: '16px',
          }}
        >
          {product.name}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '13px',
            }}
          >
            {formatPrice(product.price * (1 - product.discount))}
          </Typography>
          {product.discount > 0 && (
            <Typography
              variant="caption"
              sx={{
                textDecoration: 'line-through',
                color: 'text.disabled',
                fontSize: '10px',
              }}
            >
              {formatPrice(product.price)}
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  )
}

export default ProductSuggestChat
