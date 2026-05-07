"use client"

// ========== React & Next Imports ==========
import { useEffect, useRef, useState } from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'

// ========== Material UI Imports ==========
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'

// ========== Third Party Imports ==========
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

// ========== Config & Types Imports ==========
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig'
import { AppDispatch, RootState } from 'src/stores'

// ========== Service Imports ==========
import { getAllProducts } from 'src/services/product'
import { resetInitialState } from 'src/stores/product'

// ========== Component Imports ==========
import OutstandingBrand from './components/outstanding-brand'
const Banner = dynamic(() => import('./components/banner'), {
    ssr: false,
    loading: () => <Box sx={{ height: 400, width: '100%', bgcolor: 'grey.100' }} />
})

const OutstandingCategory = dynamic(() => import('./components/category'), {
    ssr: false,
    loading: () => <Box sx={{ height: 200, width: '100%', bgcolor: 'grey.100' }} />
})

const ListVoucher = dynamic(() => import('./components/voucher'), {
    ssr: false,
    loading: () => <Box sx={{ height: 150, width: '100%', bgcolor: 'grey.100' }} />
})

const HotSale = dynamic(() => import('./components/hot-sale'), {
    ssr: false,
    loading: () => <Box sx={{ height: 300, width: '100%', bgcolor: 'grey.100' }} />
})

const TopSale = dynamic(() => import('./components/top-sale'), {
    ssr: false,
    loading: () => <Box sx={{ height: 300, width: '100%', bgcolor: 'grey.100' }} />
})

// ========== Types ==========
interface HomePageProps {
    initialData?: {
        products?: any[];
        categories?: any[];
        featuredProducts?: any[];
        vouchers?: any[];
        // Add any other data that might be pre-fetched
    }
}

// ========== Styled Components ==========
const StyledTabs = styled(Tabs)(({ theme }) => ({
    "&.MuiTabs-root": {
        borderBottom: "none"
    }
}))

// ========== Main Component ==========
const HomePage: NextPage<HomePageProps> = ({ initialData }) => {
    // ========== State Management ==========
    // Pagination states
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])

    // Filter states
    const [sortBy, setSortBy] = useState("createdDate asc")
    const [searchBy, setSearchBy] = useState("")
    const [loading, setLoading] = useState(false)
    const [selectedReview, setSelectedReview] = useState<string>('')
    const [selectedLocation, setSelectedLocation] = useState<string>('')
    const [selectedProductCategory, setSelectedProductCategory] = useState('')

    // Data states
    const [categoryOptions, setCategoryOptions] = useState<{ label: string, value: string }[]>(
        initialData?.categories?.map((item: { name: string, _id: string }) => ({
            label: item.name,
            value: item._id
        })) || []
    )
    const [filterBy, setFilterBy] = useState<Record<string, string | string[]>>({})
    const [publicProducts, setPublicProducts] = useState({
        data: initialData?.products || [],
        total: initialData?.products?.length || 0
    })

    // Refs
    const firstRender = useRef<boolean>(initialData ? true : false)

    // ========== Hooks ==========
    const { t } = useTranslation()
    const theme = useTheme()
    const dispatch: AppDispatch = useDispatch()
    const {
        isSuccessLike,
        isErrorLike,
        errorMessageLike,
        isSuccessUnlike,
        isErrorUnlike,
        errorMessageUnlike,
        typeError,
        isLoading
    } = useSelector((state: RootState) => state.product)

    // ========== API Calls ==========
    const handleGetListProduct = async () => {
        // Skip fetching if we already have data from SSG/ISR
        if (initialData?.products && publicProducts.data.length > 0 && !filterBy.productType) {
            return;
        }
        
        setLoading(true)
        try {
            const query = {
                params: {
                    filters: "",
                    take: pageSize,
                    skip: (page - 1) * pageSize,
                    orderBy: "createdDate",
                    dir: "asc",
                    paging: true,
                    keywords: "''",
                    isPublic: true
                },
            }
            const res = await getAllProducts(query)
            if (res?.result) {
                setPublicProducts({
                    data: res?.result?.subset,
                    total: res?.result?.totalItemCount
                })
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (firstRender.current) {
            setFilterBy({
                productType: selectedProductCategory,
                minStar: selectedReview,
                productLocation: selectedLocation
            })
        }
    }, [selectedProductCategory, selectedReview, selectedLocation])

    useEffect(() => {
        if (isSuccessLike) {
            toast.success(t("like_product_success"))
            handleGetListProduct()
            dispatch(resetInitialState())
        } else if (isErrorLike && errorMessageLike && typeError) {
            toast.error(t("like_product_error"))
            dispatch(resetInitialState())
        }
    }, [isSuccessLike, isErrorLike, errorMessageLike, typeError])

    useEffect(() => {
        if (isSuccessUnlike) {
            toast.success(t("unlike_product_success"))
            handleGetListProduct()
            dispatch(resetInitialState())
        } else if (isErrorUnlike && errorMessageUnlike && typeError) {
            toast.error(t("unlike_product_error"))
            dispatch(resetInitialState())
        }
    }, [isSuccessUnlike, isErrorUnlike, errorMessageUnlike, typeError])

    // ========== Render ==========
    return (
        <Box sx={{
            height: 'fit-content',
            backgroundColor: theme.palette.background.paper
        }}>
            <Banner initialData={initialData?.featuredProducts} />
            <OutstandingCategory initialData={initialData?.categories} />
            <ListVoucher initialData={initialData?.vouchers} />
            <HotSale initialData={initialData?.featuredProducts} />
            <TopSale initialData={initialData?.products} />
            <OutstandingBrand />
        </Box>
    )
}

export default HomePage
