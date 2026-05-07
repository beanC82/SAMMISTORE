import { Box, Grid, Stack, Typography, Rating, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReviewCard from '../components/ReviewCard'
import { TReviewItem } from 'src/types/review'
import { getAllReviewByProductId, getOverallReview } from 'src/services/review'
import NoData from 'src/components/no-data'
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig'
import CustomPagination from 'src/components/custom-pagination'

interface ProductReviewProps {
    productId: number;
    onRatingDataChange: (data: { averageRating: number; totalRating: number }) => void;
}

interface OverallReview {
    averageRating: number;
    totalRating: number;
    totalRating5: number;
    totalRating4: number;
    totalRating3: number;
    totalRating2: number;
    totalRating1: number;
    totalComment: number;
    totalImage: number;
}

const ProductReview = ({ productId, onRatingDataChange }: ProductReviewProps) => {
    const [listReview, setListReview] = useState<TReviewItem[]>([])
    const [overallReview, setOverallReview] = useState<OverallReview | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedFilter, setSelectedFilter] = useState<{ typeReview: number; rateNumber: number }>({ typeReview: 0, rateNumber: 0 })
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
    const [totalReview, setTotalReview] = useState(0)
    const theme = useTheme()
    const { t } = useTranslation()

    const fetchReviews = async (typeReview = 0, rateNumber = 5, pageArg = page, pageSizeArg = pageSize) => {
        setLoading(true)
        try {
            const response = await getAllReviewByProductId({
                params: {
                    productId: productId,
                    rateNumber: rateNumber || 5,
                    typeReview: typeReview,
                    take: pageSizeArg,
                    skip: (pageArg - 1) * pageSizeArg,
                    paging: true,
                    orderBy: "",
                    dir: "asc",
                    keywords: "''",
                    filters: ""
                }
            })
            if (response?.result?.subset) {
                setListReview(response.result.subset)
                setTotalReview(response.result.totalItemCount || 0)
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchOverallReview = async () => {
        try {
            const response = await getOverallReview(productId)
            if (response?.result) {
                setOverallReview(response.result)
                onRatingDataChange({
                    averageRating: response.result.averageRating || 0,
                    totalRating: response.result.totalRating || 0
                });
            }
        } catch (error) {
            console.error('Error fetching overall review:', error)
        }
    }

    useEffect(() => {
        if (productId) {
            fetchReviews(selectedFilter.typeReview, selectedFilter.rateNumber, page, pageSize)
        }
    }, [productId, selectedFilter, page, pageSize])

    useEffect(() => {
        if (productId) {
            fetchOverallReview()
        }
    }, [productId])

    const handleOnChangePagination = (newPage: number, newPageSize: number) => {
        setPage(newPage)
        setPageSize(newPageSize)
    }

    return (
        <Box sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "15px",
            py: 10,
            px: 8
        }}>
            <Typography sx={{ textTransform: 'uppercase', cursor: 'pointer', mb: 5 }} variant="h3">
                {t('reviews_product')}
            </Typography>

            <Box
                sx={{
                    background: 'rgba(233, 69, 96, 0.05)',
                    borderRadius: '16px',
                    py: 10,
                    mb: 3,
                }}
            >
                <Grid container alignItems="center">
                    <Grid item xs={12} md={3}>
                        <Stack alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="baseline">
                                <Typography
                                    sx={{
                                        fontSize: '40px',
                                        color: theme.palette.primary.main,
                                        lineHeight: 1,
                                    }}
                                >
                                    {overallReview?.averageRating?.toFixed(1)}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '20px',
                                        color: theme.palette.primary.main,
                                        fontWeight: 500,
                                        lineHeight: 1.2,
                                        ml: '4px',
                                    }}
                                >
                                    trên 5
                                </Typography>
                            </Stack>
                            <Rating
                                value={overallReview?.averageRating || 0}
                                readOnly
                                precision={0.1}
                                sx={{
                                    color: theme.palette.primary.main,
                                    mb: 2,
                                    '& .MuiRating-icon': {
                                        color: theme.palette.primary.main
                                    }
                                }}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={9}>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            <Button
                                variant={selectedFilter.typeReview === 0 && selectedFilter.rateNumber === 0 ? 'contained' : 'outlined'}
                                onClick={() => setSelectedFilter({ typeReview: 0, rateNumber: 0 })}
                                color="primary"
                                sx={{ minWidth: 100 }}
                            >
                                Tất Cả ({overallReview?.totalRating || 0})
                            </Button>
                            <Button
                                variant={selectedFilter.typeReview === 1 && selectedFilter.rateNumber === 5 ? 'contained' : 'outlined'}
                                onClick={() => setSelectedFilter({ typeReview: 1, rateNumber: 5 })}
                                color="primary"
                                sx={{ minWidth: 100 }}
                            >
                                5 Sao ({overallReview?.totalRating5 || 0})
                            </Button>
                            <Button
                                variant={selectedFilter.typeReview === 1 && selectedFilter.rateNumber === 4 ? 'contained' : 'outlined'}
                                onClick={() => setSelectedFilter({ typeReview: 1, rateNumber: 4 })}
                                color="primary"
                                sx={{ minWidth: 100 }}
                            >
                                4 Sao ({overallReview?.totalRating4 || 0})
                            </Button>
                            <Button
                                variant={selectedFilter.typeReview === 1 && selectedFilter.rateNumber === 3 ? 'contained' : 'outlined'}
                                onClick={() => setSelectedFilter({ typeReview: 1, rateNumber: 3 })}
                                color="primary"
                                sx={{ minWidth: 100 }}
                            >
                                3 Sao ({overallReview?.totalRating3 || 0})
                            </Button>
                            <Button
                                variant={selectedFilter.typeReview === 1 && selectedFilter.rateNumber === 2 ? 'contained' : 'outlined'}
                                onClick={() => setSelectedFilter({ typeReview: 1, rateNumber: 2 })}
                                color="primary"
                                sx={{ minWidth: 100 }}
                            >
                                2 Sao ({overallReview?.totalRating2 || 0})
                            </Button>
                            <Button
                                variant={selectedFilter.typeReview === 1 && selectedFilter.rateNumber === 1 ? 'contained' : 'outlined'}
                                onClick={() => setSelectedFilter({ typeReview: 1, rateNumber: 1 })}
                                color="primary"
                                sx={{ minWidth: 100 }}
                            >
                                1 Sao ({overallReview?.totalRating1 || 0})
                            </Button>
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                                variant={selectedFilter.typeReview === 2 ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => setSelectedFilter({ typeReview: 2, rateNumber: 0 })}
                            >
                                Có Bình Luận ({overallReview?.totalComment || 0})
                            </Button>
                            <Button
                                variant={selectedFilter.typeReview === 3 ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => setSelectedFilter({ typeReview: 3, rateNumber: 0 })}
                            >
                                Có Hình Ảnh ({overallReview?.totalImage || 0})
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
            <Stack spacing={2} sx={{ pl: '68px', ml: 0 }}>
                {Array.isArray(listReview) && listReview.map((review: TReviewItem) => (
                    <ReviewCard
                        key={review.id}
                        item={review}
                        onReviewUpdated={() => fetchReviews(selectedFilter.typeReview, selectedFilter.rateNumber, page, pageSize)}
                    />
                ))}
                {(!Array.isArray(listReview) || listReview.length === 0) && (
                    <Stack sx={{
                        padding: "20px",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <NoData imageWidth="60px" imageHeight="60px" textNodata={t("no_reviews_found")} />
                    </Stack>
                )}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <CustomPagination
                        page={page}
                        pageSize={pageSize}
                        rowLength={totalReview}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        onChangePagination={handleOnChangePagination}
                    />
                </Box>
            </Stack>
        </Box>
    )
}

export default ProductReview
