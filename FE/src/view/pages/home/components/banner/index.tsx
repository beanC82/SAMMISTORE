import Grid from '@mui/material/Grid';
import React from 'react';
import Carousel from './Carousel';

interface BannerProps {
    initialData?: any[];
}

const Banner: React.FC<BannerProps> = ({ initialData }) => {

    return (
        <Grid container item spacing={4} md={12} xs={12} sx={{ width: '100%', margin: 0, maxWidth: '1440px' }}>
            <Grid item md={12} xs={12} sx={{paddingLeft: '0 !important', paddingTop: '0 !important'}}>
                <Carousel initialData={initialData} />
            </Grid>
        </Grid>
    );
};

export default Banner;