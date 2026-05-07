import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

const ProductCardSkeleton: React.FC = () => {
    return (
        <Card sx={{ width: "100%", boxShadow: "none" }}>
            <Skeleton
                variant="rectangular"
                sx={{
                    height: { xs: '180px', sm: '220px', md: '260px', lg: '300px' },
                    width: '100%',
                }}
            />
            <CardContent sx={{ padding: "8px 12px 0px 12px", pb: "10px !important" }}>
                <Skeleton variant="text" height={40} sx={{ mt: 2 }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: 1, mb: 1 }}>
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width={80} height={24} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Skeleton variant="text" width={100} height={32} />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" height={18} sx={{ borderRadius: 6 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                        <Skeleton variant="circular" width={20} height={20} />
                        <Skeleton variant="text" width={120} height={24} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCardSkeleton; 