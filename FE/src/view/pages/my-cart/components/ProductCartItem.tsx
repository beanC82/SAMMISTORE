'use client';

import { Box, Checkbox, Stack, useTheme } from '@mui/material';
import { Typography } from '@mui/material';
import { IconButton } from '@mui/material';
import { TextField } from '@mui/material';
import Link from 'next/link';
import { Fragment, useState, useEffect, useMemo, memo } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import IconifyIcon from 'src/components/Icon';
import { useAuth } from 'src/hooks/useAuth';
import { AppDispatch } from 'src/stores';
import { formatPrice } from 'src/utils';
import Image from 'src/components/image';
import { createCartAsync, deleteCartAsync } from 'src/stores/cart/action';
import { useDebounce } from 'src/hooks/useDebounce';

type TProps = {
  item: {
    cartId: number;
    productId: number;
    productName: string;
    price: number;
    newPrice: number;
    quantity: number;
    productImage: string;
    stockQuantity: number;
  };
  index: number;
  handleChangeCheckBox: (value: number) => void;
  selectedRow: number[];
};

const ProductCartItem = ({ item, index, handleChangeCheckBox, selectedRow }: TProps) => {
  const { user } = useAuth();
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();

  const [inputQuantity, setInputQuantity] = useState<string | number>(item.quantity);
  const debouncedQuantity = useDebounce(inputQuantity, 500);

  useEffect(() => {
    if (debouncedQuantity !== item.quantity && debouncedQuantity !== '') {
      handleDebouncedQuantityChange(Number(debouncedQuantity));
    }
  }, [debouncedQuantity]);

  const handleChangeQuantity = async (amountChange: number) => {
    if (!user) return;

    const newQuantity = item.quantity + amountChange;
    if (newQuantity < 1) {
      toast.error('Số lượng không được nhỏ hơn 1!');
      return;
    }
    if (item.stockQuantity && newQuantity > item.stockQuantity) {
      toast.error(`Số lượng không được vượt quá ${item.stockQuantity} sản phẩm trong kho!`);
      return;
    }

    setInputQuantity(newQuantity);

    try {
      await dispatch(
        createCartAsync({
          cartId: item.cartId,
          productId: item.productId,
          quantity: newQuantity,
          operation: 2,
        })
      ).unwrap();
    } catch (error) {
      toast.error('Cập nhật số lượng thất bại!');
      setInputQuantity(item.quantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setInputQuantity('');
      return;
    }
    const newQuantity = parseInt(value);
    if (isNaN(newQuantity)) {
      toast.error('Vui lòng nhập số hợp lệ!');
      return;
    }
    setInputQuantity(newQuantity);
  };

  const handleDebouncedQuantityChange = async (newQuantity: number) => {
    if (!user) return;

    if (newQuantity < 1) {
      toast.error('Số lượng không được nhỏ hơn 1!');
      setInputQuantity(item.quantity);
      return;
    }
    if (item.stockQuantity && newQuantity > item.stockQuantity) {
      toast.error(`Số lượng không được vượt quá ${item.stockQuantity} sản phẩm trong kho!`);
      setInputQuantity(item.quantity);
      return;
    }

    try {
      await dispatch(
        createCartAsync({
          cartId: item.cartId,
          productId: item.productId,
          quantity: newQuantity,
          operation: 2,
        })
      ).unwrap();
    } catch (error) {
      toast.error('Cập nhật số lượng thất bại!');
      setInputQuantity(item.quantity);
    }
  };

  const handleDeleteProductInCart = async (id: number) => {
    if (!user) return;
    try {
      await dispatch(deleteCartAsync(id));
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại!');
    }
  };

  const totalPrice = item.newPrice * item.quantity;

  return (
    <Fragment>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          py: 3,
          minWidth: '100%',
          maxWidth: { xs: '100%', md: '60%' },
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <Stack sx={{ width: 40 }}>
          <Checkbox
            disabled={!item.stockQuantity || item.stockQuantity === 0}
            checked={selectedRow.includes(item.productId)}
            value={item.productId}
            onChange={() => handleChangeCheckBox(item.productId)}
          />
        </Stack>

        <Stack direction="row" alignItems="center" flexGrow={1} sx={{ width: { xs: '100%', md: '40%' } }}>
          <Image
            src={item.productImage || '/public/svgs/placeholder.svg'}
            sx={{ width: 80, height: 80, flexShrink: 0, borderRadius: 1.5, bgcolor: 'background.neutral' }}
          />
          <Stack spacing={0.5} sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ textWrap: 'wrap' }}>
              <Link href={`/product/${item.productId}`}>{item.productName}</Link>
            </Typography>
          </Stack>
        </Stack>

        <Stack
          sx={{
            width: 180,
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'column', lg: 'row' },
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: item.price !== item.newPrice ? theme.palette.grey[500] : theme.palette.primary.main,
              textDecoration: item.price !== item.newPrice ? 'line-through' : 'none',
            }}
          >
            {formatPrice(item.price)}
          </Typography>
          {item.price !== item.newPrice && (
            <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }}>
              {formatPrice(item.newPrice)}
            </Typography>
          )}
        </Stack>

        <Stack sx={{ width: { xs: '100%', md: 90, lg: 120 }, pt: 4, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              sx={{ p: { xs: 0, md: 0, lg: 2 } }}
              onClick={() => handleChangeQuantity(-1)}
              disabled={item.quantity <= 1}
            >
              <IconifyIcon icon="mdi:minus" />
            </IconButton>
            <TextField
              type="number"
              value={inputQuantity}
              onChange={handleInputChange}
              size="small"
              inputProps={{ min: 1, max: item.stockQuantity, style: { textAlign: 'center' } }}
              sx={{
                width: 70,
                '& input': {
                  py: 1,
                  px: 0,
                  textAlign: 'center',
                  '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': { display: 'none' },
                  '-moz-appearance': 'textfield',
                },
              }}
            />
            <IconButton
              sx={{ p: { xs: 0, md: 0, lg: 2 } }}
              onClick={() => handleChangeQuantity(1)}
              disabled={item.quantity >= (item.stockQuantity || 0)}
            >
              <IconifyIcon icon="mdi:plus" />
            </IconButton>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              textAlign: 'center',
              width: '100%',
              mt: 0.5,
              display: 'block',
            }}
          >
            Còn {item.stockQuantity || 0} sản phẩm
          </Typography>
        </Stack>

        <Stack sx={{ width: { xs: '100%', md: 90, lg: 90 }, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
            {formatPrice(totalPrice)}
          </Typography>
        </Stack>

        <Stack sx={{ width: 40 }}>
          <IconButton onClick={() => handleDeleteProductInCart(item.productId)}>
            <IconifyIcon icon="carbon:trash-can" />
          </IconButton>
        </Stack>
      </Stack>
    </Fragment>
  );
};

export default memo(ProductCartItem);
