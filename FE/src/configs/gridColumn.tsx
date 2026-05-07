// src/configs/orderGridConfig.ts
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { styled, Chip, ChipProps, Typography, useTheme, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatDate, formatPrice } from 'src/utils'
import Image from 'src/components/image'
import { getReceiptStatusLabel } from 'src/configs/receipt'
import { PaymentStatus, ShippingStatus, OrderStatus } from 'src/configs/order'
import { useMemo } from 'react'
import { getEventTypeLabel } from './event'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

const StyledPublicProduct = styled(Chip)<ChipProps>(({ theme }) => ({
  backgroundColor: "#28c76f29",
  color: "#28c76f",
  fontSize: "14px",
  padding: "8px 4px",
  fontWeight: 600
}))

const StyledPrivateProduct = styled(Chip)<ChipProps>(({ theme }) => ({
  backgroundColor: "#da251d29",
  color: "#da251d",
  fontSize: "14px",
  padding: "8px 4px",
  fontWeight: 600
}))

const StyledPendingProduct = styled(Chip)<ChipProps>(({ theme }) => ({
  backgroundColor: "#ff980029",
  color: "#ff9800",
  fontSize: "14px",
  padding: "8px 4px",
  fontWeight: 600
}))

interface TStatusChip extends ChipProps {
  background: string
}

const StyledOrderStatus = styled(Chip)<TStatusChip>(({ theme, background }) => ({
  backgroundColor: `${background}29`,
  color: background,
  fontSize: "14px",
  padding: "8px 4px",
  fontWeight: 600
}))

export const getOrderColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: 'customerName',
      headerName: t('customer_name'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.customerName} - {row?.phoneNumber}</Typography>
      }
    },
    {
      field: 'customerAddress',
      headerName: t('customer_address'),
      flex: 1,
      minWidth: 300,
      maxWidth: 300,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{ textWrap: 'wrap' }}>{row?.customerAddress}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('place_order_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'quantity',
      headerName: t('quantity'),
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography>{row?.totalQuantity}</Typography>
      }
    },
    {
      field: 'totalPrice',
      headerName: t('total_price'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography>{row?.totalPrice}</Typography>
      }
    },
    {
      field: 'paymentStatus',
      headerName: t('payment_status'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        const status = row?.paymentStatus
        let background = theme.palette.grey[500]
        let label = ''

        switch (status) {
          case PaymentStatus.Pending.label:
            background = theme.palette.warning.main
            label = t(PaymentStatus.Pending.title)
            break
          case PaymentStatus.Unpaid.label:
            background = theme.palette.error.main
            label = t(PaymentStatus.Unpaid.title)
            break
          case PaymentStatus.Paid.label:
            background = theme.palette.success.main
            label = t(PaymentStatus.Paid.title)
            break
          case PaymentStatus.Failed.label:
            background = theme.palette.error.main
            label = t(PaymentStatus.Failed.title)
            break
        }

        return <StyledOrderStatus background={background} label={label} />
      }
    },
    {
      field: 'shippingStatus',
      headerName: t('shipping_status'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        const status = row?.shippingStatus
        let background = theme.palette.grey[500]
        let label = ''

        switch (status) {
          case ShippingStatus.NotShipped.label:
            background = theme.palette.warning.main
            label = t(ShippingStatus.NotShipped.title)
            break
          case ShippingStatus.Processing.label:
            background = theme.palette.info.main
            label = t(ShippingStatus.Processing.title)
            break
          case ShippingStatus.Delivered.label:
            background = theme.palette.success.main
            label = t(ShippingStatus.Delivered.title)
            break
          case ShippingStatus.Lost.label:
            background = theme.palette.error.main
            label = t(ShippingStatus.Lost.title)
            break
        }

        return <StyledOrderStatus background={background} label={label} />
      }
    },
    {
      field: 'orderStatus',
      headerName: t('order_status'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        const status = row?.orderStatus
        let background = theme.palette.grey[500]
        let label = ''

        switch (status) {
          case OrderStatus.Pending.label:
            background = theme.palette.warning.main
            label = t(OrderStatus.Pending.title)
            break
          case OrderStatus.WaitingForPayment.label:
            background = theme.palette.warning.main
            label = t(OrderStatus.WaitingForPayment.title)
            break
          case OrderStatus.Processing.label:
            background = theme.palette.info.main
            label = t(OrderStatus.Processing.title)
            break
          case OrderStatus.Completed.label:
            background = theme.palette.success.main
            label = t(OrderStatus.Completed.title)
            break
          case OrderStatus.Cancelled.label:
            background = theme.palette.error.main
            label = t(OrderStatus.Cancelled.title)
            break
        }

        return <StyledOrderStatus background={background} label={label} />
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ]
}

export const getProvinceColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: "name",
      headerName: t("province_name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.name}</Typography>,
    },
    {
      field: "code",
      headerName: t("province_code"),
      minWidth: 300,
      maxWidth: 300,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
    },
    {
      field: "postalCode",
      headerName: t("postal_code"),
      minWidth: 300,
      maxWidth: 300,
      renderCell: (params: GridRenderCellParams) => <Typography sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
      }}>{params.row.postalCode}</Typography>,
    },
  ];
}

export const getDistrictColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: "name",
      headerName: t("district_name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.name}</Typography>,
    },
    {
      field: "code",
      headerName: t("district_code"),
      minWidth: 300,
      maxWidth: 300,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
    },
    {
      field: "provinceId",
      headerName: t("province_name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
      }}>{params.row.provinceName}</Typography>,
    },
  ]
}

export const getWardColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: "name",
      headerName: t("ward_name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => 
        <Tooltip title={params.row.name}>
          <Typography sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>{params.row.name}</Typography>
        </Tooltip>
    },
    {
      field: "code",
      headerName: t("ward_code"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
    },
    {
      field: "districtName",
      headerName: t("district_name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.districtName}</Typography>,
    },
    {
      field: "districtCode",
      headerName: t("district_code"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.districtCode}</Typography>,
    },
  ];
}

export const getBrandColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: "name",
      headerName: t("brand_name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{params.row.name}</Typography>
      ),
    },
    {
      field: "code",
      headerName: t("brand_code"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{params.row.code}</Typography>
      ),
    },
    {
      field: 'createdBy',
      headerName: t('created_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.createdBy}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ];
}

export const getProductColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: 'name',
      headerName: t('product_name'),
      flex: 1,
      minWidth: 350,
      maxWidth: 350,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Tooltip title={row?.name}>
            <Typography sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}>{row?.name}</Typography>
          </Tooltip>
        )
      }
    },
    {
      field: 'brandName',
      headerName: t('brand'),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{row?.brandName}</Typography>
        )
      }
    },
    {
      field: 'categoryName',
      headerName: t('product_category'),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{row?.categoryName}</Typography>
        )
      }
    },
    {
      field: 'importPrice',
      headerName: t('import_price'),
      minWidth: 150,
      maxWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{`${formatPrice(row?.importPrice)}`}</Typography>
        )
      }
    },
    {
      field: 'price',
      headerName: t('price'),
      minWidth: 150,
      maxWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{`${formatPrice(row?.price)}`}</Typography>
        )
      }
    },
    {
      field: 'newPrice',
      headerName: t('discount_price'),
      minWidth: 250,
      maxWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{`${formatPrice(row?.newPrice)}`}</Typography>
        )
      }
    },
    {
      field: 'stockQuantity',
      headerName: t('stock_quantity'),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{row?.stockQuantity}</Typography>
        )
      }
    },
    {
      field: 'discount',
      headerName: t('discount'),
      minWidth: 100,
      maxWidth: 100,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{row?.discount * 100}</Typography>
        )
      }
    },
    {
      field: 'status',
      headerName: t('status'),
      flex: 1,
      minWidth: 140,
      maxWidth: 140,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <>
            {row?.status === 1 ? (
              <StyledPublicProduct label={t('public')} />
            ) : row?.status === 0 ? (
              <StyledPrivateProduct label={t('private')} />
            ) : (
              <StyledPendingProduct label={t('pending')} />
            )}
          </>
        )
      }
    },
    {
      field: 'createdBy',
      headerName: t('created_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.createdBy}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ]
}

export const getProductCategoryColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: 'code',
      headerName: t('product_category_code'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{row?.code}</Typography>
        )
      }
    },
    {
      field: 'name',
      headerName: t('product_category_name'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{row?.name}</Typography>
        )
      }
    },
    {
      field: 'parentName',
      headerName: t('parent_name'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{row?.parentName}</Typography>
        )
      }
    },
    {
      field: 'level',
      headerName: t('category_level'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>{row?.level}</Typography>
        )
      }
    },
    {
      field: 'createdBy',
      headerName: t('created_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.createdBy}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ];
}

export const getBannerColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: 'name',
      headerName: t('banner_name'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{params.row.name}</Typography>
      )
    },

    {
      field: 'level',
      headerName: t('banner_level'),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{params.row.level}</Typography>
      )
    },

    {
      field: 'imageUrl',
      headerName: t('banner_image'),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Image src={params.row.imageUrl} alt={params.row.name} width={50} height={50} />
      )
    },

    {
      field: 'status',
      headerName: t('status'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <>
            {row?.isActive === true ? (
              <StyledPublicProduct label={t('active')} />
            ) : (
              <StyledPrivateProduct label={t('inactive')} />
            )
            }
          </>
        )
      }
    },

    {
      field: 'createdAt',
      headerName: t('created_at'),
      minWidth: 220,
      maxWidth: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{formatDate(params.row.createdDate, { dateStyle: "short", timeStyle: "short" })}</Typography>
      )
    }, 
    {
      field: 'createdBy',
      headerName: t('created_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.createdBy}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ]
}

export const getPaymentMethodColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: 'name',
      headerName: t('payment_method_name'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{params.row.name}</Typography>
      )
    },
    {
      field: 'createdAt',
      headerName: t('created_at'),
      minWidth: 220,
      maxWidth: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{formatDate(params.row.createdDate, { dateStyle: "short", timeStyle: "short" })}</Typography>
      )
    }
  ]
}

export const getReceiptColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: "code",
      headerName: t("receipt_code"),
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
    },
    {
      field: "employeeName",
      headerName: t("employee"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.employeeName}</Typography>,
    },
    {
      field: "createdDate",
      headerName: t("receipt_date"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{formatDate(params.row.createdDate, { dateStyle: "short", timeStyle: "short" })}</Typography>
    },
    {
      field: "supplierName",
      headerName: t("supplier_name"),
      minWidth: 350,
      maxWidth: 350,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.supplierName}</Typography>,
    },
    {
      field: "totalPrice",
      headerName: t("total_price"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{formatPrice(params.row.totalPrice)}</Typography>,
    },
    {
      field: "status",
      headerName: t("status"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        const status = row?.status
        let background = theme.palette.grey[500]
        let label = getReceiptStatusLabel(status)

        switch (status) {
          case "Draft":
            background = theme.palette.grey[500]
            break
          case "PendingApproval":
            background = theme.palette.warning.main
            break
          case "Approved":
            background = theme.palette.success.main
            break
          case "Processing":
            background = theme.palette.info.main
            break
          case "Completed":
            background = theme.palette.success.main
            break
          case "Canceled":
            background = theme.palette.error.main
            break
        }

        return <StyledOrderStatus background={background} label={label} />
      }
    },
    {
      field: 'createdBy',
      headerName: t('created_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.createdBy}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ];
}


export const getVoucherColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: "code",
      headerName: t("voucher_code"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
    },
    {
      field: "name",
      headerName: t("voucher_name"),
      minWidth: 300,
      maxWidth: 300,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.name}</Typography>
    },
    {
      field: "eventName",
      headerName: t("event_name"),
      minWidth: 300,
      maxWidth: 300,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.eventName}</Typography>
    },
    {
      field: "startDate",
      headerName: t("start_date"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{formatDate(params.row.startDate, { dateStyle: "short", timeStyle: "short" })}</Typography>
    },
    {
      field: "endDate",
      headerName: t("end_date"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{formatDate(params.row.endDate, { dateStyle: "short", timeStyle: "short" })}</Typography>
    },
    {
      field: "discountType",
      headerName: t("discount_type_name"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.discountName}</Typography>,
    },
    {
      field: "discountValue",
      headerName: t("discount_value"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.discountValue}</Typography>,
    },
    {
      field: "usageLimit",
      headerName: t("usage_limit"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.usageLimit}</Typography>,
    },
    {
      field: "usedCount",
      headerName: t("used_count"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.usedCount}</Typography>,
    },
    {
      field: 'status',
      headerName: t('status'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <>
            {row?.isActive === true ? (
              <StyledPublicProduct label={t('active')} />
            ) : (
              <StyledPrivateProduct label={t('inactive')} />
            )
            }
          </>
        )
      }
    },
    {
      field: 'createdBy',
      headerName: t('created_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.createdBy}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ];
}

export const getEventColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: "imageId",
      headerName: t("event_image"),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Image src={params.row.imageUrl} alt={params.row.name} width={50} height={50} />,
    },
    {
      field: "code",
      headerName: t("event_code"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
    },
    {
      field: "name",
      headerName: t("event_name"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.name}</Typography>
    },
    {
      field: "startDate",
      headerName: t("start_date"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{formatDate(params.row.startDate, { dateStyle: "short", timeStyle: "short" })}</Typography>,
    },
    {
      field: "endDate",
      headerName: t("end_date"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{formatDate(params.row.endDate, { dateStyle: "short", timeStyle: "short" })}</Typography>,
    },
    {
      field: "eventType",
      headerName: t("event_type"),
      minWidth: 300,
      maxWidth: 300,
      renderCell: (params: GridRenderCellParams) => <Typography>{getEventTypeLabel(params.row.eventType)}</Typography>,
    },
    {
      field: 'status',
      headerName: t('status'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <>
            {row?.isActive === true ? (
              <StyledPublicProduct label={t('active')} />
            ) : (
              <StyledPrivateProduct label={t('inactive')} />
            )
            }
          </>
        )
      }
    },
    {
      field: 'createdBy',
      headerName: t('created_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.createdBy}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ];
}


export const getCustomerColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  return [
    {
      field: "code",
      headerName: t("customer_code"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
  },
  {
    field: "fullName",
    headerName: t("name"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.fullName}</Typography>,
  },
  {
    field: "phone",
    headerName: t("phone"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.phone}</Typography>,
  },
  {
    field: 'birthday',
    headerName: t('birthday'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return (
        <Typography>
          {formatDate(row?.birthday, { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      )
    }
  },
  {
    field: "email",
    headerName: t("email"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.email}</Typography>,
  },
  {
    field: "gender",
    headerName: t("gender"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <Typography>
          {params.row.gender === 1 ? t("male") : params.row.gender === 0 ? t("female") : t("unknown")}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: t('status'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <>
            {row?.isLock === false ? (
              <StyledPublicProduct label={t('active')} />
            ) : (
              <StyledPrivateProduct label={t('locked')} />
            )
            }
          </>
        )
      }
    },
    {
      field: 'createdBy',
      headerName: t('created_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.createdBy}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
    {
      field: 'updatedBy',
      headerName: t('updated_by'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.updatedBy}</Typography>
      }
    },
    {
      field: 'updatedDate',
      headerName: t('updated_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    },
  ]
}

export const getEmployeeColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  return [
    {
      field: "code",
      headerName: t("employee_code"),
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
  },
  {
    field: "fullName",
    headerName: t("name"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.fullName}</Typography>,
  },
  {
    field: "cardNumber",
    headerName: t("card_number"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.idCardNumber}</Typography>,
  },
  {
    field: "phone",
    headerName: t("phone"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.phone}</Typography>,
  },
  {
    field: 'birthday',
    headerName: t('birthday'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return (
        <Typography>
          {formatDate(row?.birthday, { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      )
    }
  },
  {
    field: "email",
    headerName: t("email"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.email}</Typography>,
  },
  {
    field: "address",
    headerName: t("address"),
    minWidth: 300,
    maxWidth: 300,
    renderCell: (params: GridRenderCellParams) => <Typography sx={{
      textWrap: 'wrap',
    }}>{params.row.streetAddress ? `${params.row.streetAddress}, ` : ''}{params.row.wardName}, {params.row.districtName}, {params.row.provinceName}</Typography>,
  },
  {
    field: "gender",
    headerName: t("gender"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <Typography>
        {params.row.gender === 1 ? t("male") : params.row.gender === 0 ? t("female") : t("unknown")}
      </Typography>
    ),
  },
  {
    field: 'createdBy',
    headerName: t('created_by'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return <Typography sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
      }}>{row?.createdBy}</Typography>
    }
  },
  {
    field: 'createdDate',
    headerName: t('created_date'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return (
        <Typography>
          {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      )
    }
  },
  {
    field: 'updatedBy',
    headerName: t('updated_by'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return <Typography sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
      }}>{row?.updatedBy}</Typography>
    }
  },
  {
    field: 'updatedDate',
    headerName: t('updated_date'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return (
        <Typography>
          {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      )
    }
  },
  ]
}

export const getSupplierColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  return [
    {
      field: "code",
      headerName: t("supplier_code"),
      minWidth: 200,
      maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>,
  },
  {
    field: "fullName",
    headerName: t("name"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.fullName}</Typography>,
  },
  {
    field: "phone",
    headerName: t("phone"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.phone}</Typography>,
  },
  {
    field: "email",
    headerName: t("email"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => <Typography>{params.row.email}</Typography>,
  },
  {
    field: "address",
    headerName: t("address"),
    minWidth: 300,
    maxWidth: 300,
    renderCell: (params: GridRenderCellParams) => <Typography sx={{
      textWrap: 'wrap',
    }}>{params.row.streetAddress ? `${params.row.streetAddress}, ` : ''}{params.row.wardName}, {params.row.districtName}, {params.row.provinceName}</Typography>,
  },
  {
    field: "gender",
    headerName: t("gender"),
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <Typography>
        {params.row.gender === 1 ? t("male") : params.row.gender === 0 ? t("female") : t("unknown")}
      </Typography>
    ),
  },
  {
    field: 'createdBy',
    headerName: t('created_by'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return <Typography sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
      }}>{row?.createdBy}</Typography>
    }
  },
  {
    field: 'createdDate',
    headerName: t('created_date'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return (
        <Typography>
          {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      )
    }
  },
  {
    field: 'updatedBy',
    headerName: t('updated_by'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return <Typography sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
      }}>{row?.updatedBy}</Typography>
    }
  },
  {
    field: 'updatedDate',
    headerName: t('updated_date'),
    flex: 1,
    minWidth: 200,
    maxWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params
      return (
        <Typography>
          {formatDate(row?.updatedDate, { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      )
    }
  },
  ]
}

export const getRevenueColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  const theme = useTheme()
  return [
    {
      field: 'code',
      headerName: t('order_code'),
      flex: 1,
      minWidth: 350,
      maxWidth: 350,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography>{row?.code}</Typography>
      }
    },
    {
      field: 'customerName',
      headerName: t('customer_name'),
      flex: 1,
      minWidth: 250,
      maxWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}>{row?.customerName} - {row?.phoneNumber}</Typography>
      }
    },
    {
      field: 'paymentMethod',
      headerName: t('payment_method'),
      flex: 1,
      minWidth: 250,
      maxWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography>{row?.paymentMethod}</Typography>
      }
    },
    {
      field: 'orderStatus',
      headerName: t('order_status'),
      flex: 1,
      minWidth: 250,
      maxWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        const status = row?.orderStatus
        let background = theme.palette.grey[500]
        let label = ''

        switch (status) {
          case 'Pending':
            background = theme.palette.warning.main
            label = t('pending')
            break
          case 'WaitingForPayment':
            background = theme.palette.warning.main
            label = t('waiting_for_payment')
            break
          case 'Processing':
            background = theme.palette.info.main
            label = t('processing')
            break
          case 'Completed':
            background = theme.palette.success.main
            label = t('completed')
            break
          case 'Cancelled':
            background = theme.palette.error.main
            label = t('cancelled')
            break
        }

        return <StyledOrderStatus background={background} label={label} />
      }
    },
    {
      field: 'totalPrice',
      headerName: t('total_price'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography>{formatPrice(row?.totalPrice || 0)}</Typography>
      }
    },
    {
      field: 'totalQuantity',
      headerName: t('quantity'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return <Typography>{row?.totalQuantity}</Typography>
      }
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 200,
      maxWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Typography>
            {formatDate(row?.createdDate, { dateStyle: "medium", timeStyle: "short" })}
          </Typography>
        )
      }
    }
  ]
}


export const getImportColumns = (): GridColDef[] => {
  const { t } = useTranslation()
  return [
    {
      field: 'code',
      headerName: t('receipt_code'),
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>
    },
    {
      field: 'employeeName',
      headerName: t('employee'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.employeeName}</Typography>
    },
    {
      field: 'supplierName',
      headerName: t('supplier'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.supplierName}</Typography>
    },
    {
      field: 'totalPrice',
      headerName: t('total_price'),
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => <Typography>{formatPrice(params.row.totalPrice || 0)}</Typography>
    },
    {
      field: 'totalQuantity',
      headerName: t('quantity'),
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.totalQuantity}</Typography>
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>
          {formatDate(params.row.createdDate, { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      )
    }
  ]
} 
