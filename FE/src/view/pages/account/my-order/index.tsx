"use client"

// React & Next
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'

// MUI
import { Stack, styled, Tab, Tabs, useTheme, Box, TabsProps } from '@mui/material'

// i18n
import { useTranslation } from 'react-i18next'

// Redux
import { AppDispatch, RootState } from 'src/stores'
import { useDispatch, useSelector } from 'react-redux'

// Hooks & Types

import { TOrderItem } from 'src/types/order'


// Configs
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig'
import { OrderStatus } from 'src/configs/order'

// Dynamic Imports - Với loading indicator để cải thiện UX
const Spinner = dynamic(() => import('src/components/spinner'), { ssr: false })
const NoData = dynamic(() => import('src/components/no-data'), {
    ssr: false,
    loading: () => <Spinner />
})

const SearchField = dynamic(() => import('src/components/search-field'), { ssr: false })
const CustomPagination = dynamic(() => import('src/components/custom-pagination'), { ssr: false })
const OrderCard = dynamic(() => import('./components/OrderCard'), {
    ssr: false,
    loading: () => <Spinner />
})

// Actions
import { resetInitialState } from 'src/stores/order'
import { getMyOrdersAsync } from 'src/stores/order/action'
// Utils
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

// Styled Components
const StyledTabs = styled(Tabs)<TabsProps>(({ theme }) => ({
    "&.MuiTabs-root": {
        borderBottom: "none"
    }
}))

// Debounce function for search
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Custom Hooks
const useOrderList = () => {
    const [selectedStatus, setSelectedStatus] = useState<string>("all")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
    const [searchBy, setSearchBy] = useState("")
    const debouncedSearchTerm = useDebounce(searchBy, 500); // Debounce search để tránh gọi API liên tục

    const dispatch: AppDispatch = useDispatch()
    const { myOrders, isLoading, isErrorCancel, isSuccessCancel, errorMessageCancel } = useSelector((state: RootState) => state.order)

    // Dùng memo để giảm re-renders không cần thiết
    const queryParams = useMemo(() => ({
        params: {
            take: pageSize,
            skip: (page - 1) * pageSize,
            paging: true,
            orderBy: selectedStatus === "Cancelled" ? "updatedDate" : "createdDate",
            dir: "desc",
            keywords: debouncedSearchTerm || "''",
            filters: selectedStatus === "all" ? "" : `orderStatus::${selectedStatus}::eq`
        }
    }), [pageSize, page, debouncedSearchTerm, selectedStatus]);

    const handleGetListOrder = useCallback(() => {
        dispatch(getMyOrdersAsync(queryParams))
    }, [queryParams, dispatch])


    const handleOnChangePagination = useCallback((page: number, pageSize: number) => {
        setPage(page)
        setPageSize(pageSize)
    }, [])

    const handleChangeStatus = useCallback((event: React.SyntheticEvent, newValue: string) => {
        setSelectedStatus(newValue)
        setPage(1) // Reset về trang đầu khi thay đổi filter
    }, [])

    const handleSearch = useCallback((value: string) => {
        setSearchBy(value)
        setPage(1) // Reset về trang đầu khi tìm kiếm
    }, [])

    return {
        selectedStatus,
        page,
        pageSize,
        searchBy,
        myOrders,
        isLoading,
        isErrorCancel,
        isSuccessCancel,
        errorMessageCancel,
        handleGetListOrder,
        handleOnChangePagination,
        handleChangeStatus,
        handleSearch
    }
}

const MyOrderPage: NextPage = () => {
    // Hooks
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const dispatch = useDispatch()

    // Custom Hook
    const {
        selectedStatus,
        page,
        pageSize,
        searchBy,
        myOrders,
        isLoading,
        isErrorCancel,
        isSuccessCancel,
        errorMessageCancel,
        handleGetListOrder,
        handleOnChangePagination,
        handleChangeStatus,
        handleSearch
    } = useOrderList()

    // Effects
    useEffect(() => {
        handleGetListOrder()
        return () => {
            dispatch(resetInitialState())
        }
    }, [page, pageSize, selectedStatus, searchBy, handleGetListOrder, dispatch])

    useEffect(() => {
        if (isSuccessCancel) {
            toast.success(t("cancel_order_success"))
            handleGetListOrder()
            dispatch(resetInitialState())
        } else if (isErrorCancel && errorMessageCancel) {
            toast.error(errorMessageCancel)
            dispatch(resetInitialState())
        }
    }, [isSuccessCancel, isErrorCancel, errorMessageCancel, dispatch, handleGetListOrder, t])

    // Memoized Components để tránh re-renders không cần thiết
    const renderTabs = useMemo(() => (
        <StyledTabs
            value={selectedStatus}
            onChange={handleChangeStatus}
            aria-label="wrapped label tabs example"
            variant="scrollable" // Thêm variant scrollable cho màn hình nhỏ
            scrollButtons="auto" // Hiển thị nút scroll khi cần
        >
            <Tab
                key="all"
                value="all"
                label={t("all")}
                wrapped
            />
            {Object.values(OrderStatus).map((option) => (
                <Tab
                    key={option.label}
                    value={option.label}
                    label={t(option.title)}
                    wrapped
                />
            ))}
        </StyledTabs>
    ), [selectedStatus, handleChangeStatus, t])

    const renderSearch = useMemo(() => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mr: { xs: '1rem', sm: '2rem' } }}>
            <Box sx={{ width: { xs: '100%', sm: '300px' } }}>
                <SearchField
                    value={searchBy}
                    placeholder={t('search_by_product_name')}
                    onChange={handleSearch}
                />
            </Box>
        </Box>
    ), [searchBy, handleSearch, t])


    const renderOrdersList = useMemo(() => {
        if (!myOrders?.data?.length) return null;

        return myOrders.data.map((item: TOrderItem, index: number) => (
            <OrderCard orderData={item} key={item.id || index} />
        ));
    }, [myOrders?.data]);

    const renderPagination = useMemo(() => {
        if (!myOrders?.data?.length) return null;

        return (
            <CustomPagination
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onChangePagination={handleOnChangePagination}
                page={page}
                rowLength={myOrders.total}
            />
        );
    }, [pageSize, page, myOrders?.total, handleOnChangePagination]);

    const renderContent = useMemo(() => {
        if (isLoading) return <Spinner />

        if (myOrders?.data?.length > 0) {
            return (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: "100%",
                    flexDirection: "column",
                    padding: { xs: '1rem', sm: '2rem' },
                    paddingTop: '1rem',
                    gap: 6,
                }}>
                    {renderOrdersList}
                    {renderPagination}
                </Box>
            )
        }

        return (
            <Stack sx={{
                padding: "20px",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "30vh",
            }}>
                <NoData
                    imageWidth="60px"
                    imageHeight="60px"
                    textNodata={t("empty_order")}
                />
            </Stack>
        )
    }, [isLoading, myOrders?.data?.length, renderOrdersList, renderPagination, t])

    return (
        <Box sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "15px",
            py: 5,
            px: { xs: 2, sm: 4 },
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden', 
        }}>
            {renderTabs}
            {renderSearch}
            {renderContent}
        </Box>
    )
}

export default React.memo(MyOrderPage)
