import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Chip,
  Button,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';

interface CollectionItem {
  id: string;
  name: string;
  imageUrl: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  gift?: string;
  badges: string[];
  isBestSeller?: boolean;
  isFreeShip?: boolean;
}

interface PriceRange {
  label: string;
  min: number;
  max?: number;
}

const CollectionPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const brands = [
    'Horus',
    'Freska',
    'Colour Me',
    'Skin1004',
    'Dear, Klairs',
    'Bioderma',
    'La Roche-Posay',
    'Maybelline',
  ];

  const priceRanges: PriceRange[] = [
    { label: 'Dưới 100.000đ', min: 0, max: 100000 },
    { label: '100.000đ - 200.000đ', min: 100000, max: 200000 },
    { label: '200.000đ - 300.000đ', min: 200000, max: 300000 },
    { label: '300.000đ - 500.000đ', min: 300000, max: 500000 },
    { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
    { label: 'Trên 1.000.000đ', min: 1000000 },
  ];

  // Mock data with actual product information
  const mockCollectionItems: CollectionItem[] = [
    {
      id: '1',
      name: 'La Roche-Posay Sữa Rửa Mặt Purifying Foaming Cleanser',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3',
      brand: 'La Roche-Posay',
      originalPrice: 210000,
      discountedPrice: 115000,
      discountPercentage: 45,
      gift: 'Tặng 1 QT La Roche-Posay Sữa Rửa Mặt',
      badges: ['Freeship'],
      isFreeShip: true
    },
    {
      id: '2',
      name: 'Bioderma Nước tẩy trang Sensibio H2O',
      imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?ixlib=rb-4.0.3',
      brand: 'Bioderma',
      originalPrice: 545000,
      discountedPrice: 463250,
      discountPercentage: 15,
      gift: 'Tặng 04 QT Bioderma Combo sample',
      badges: ['Freeship', 'Best Selling'],
      isBestSeller: true,
      isFreeShip: true
    },
    {
      id: '3',
      name: 'Maybelline Chuốt Mi Lash Sensational Sky High',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3',
      brand: 'Maybelline',
      originalPrice: 228000,
      discountedPrice: 200640,
      discountPercentage: 12,
      gift: 'Tặng QT Kem nền mini',
      badges: ['Freeship', 'Best Selling'],
      isBestSeller: true,
      isFreeShip: true
    }
  ];

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const FilterSection = () => (
    <Box sx={{ width: isMobile ? '100%' : 250, p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        THƯƠNG HIỆU
      </Typography>
      <FormGroup>
        {brands.map((brand) => (
          <FormControlLabel
            key={brand}
            control={
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
              />
            }
            label={brand}
          />
        ))}
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
        MỨC GIÁ
      </Typography>
      <FormGroup>
        {priceRanges.map((range) => (
          <FormControlLabel
            key={range.label}
            control={
              <Checkbox
                checked={selectedPriceRanges.includes(range.label)}
                onChange={() => handlePriceRangeChange(range.label)}
              />
            }
            label={range.label}
          />
        ))}
      </FormGroup>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        ƯU ĐÃI HOT, ĐỪNG BỎ LỠ!!
      </Typography>

      {/* Mobile filter button */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<FilterListIcon />}
            variant="outlined"
            onClick={() => setMobileFilterOpen(true)}
            fullWidth
          >
            Lọc sản phẩm
          </Button>
        </Box>
      )}

      {/* Sorting options */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="outlined" size="small">Tên A → Z</Button>
        <Button variant="outlined" size="small">Tên Z → A</Button>
        <Button variant="outlined" size="small">Giá tăng dần</Button>
        <Button variant="outlined" size="small">Giá giảm dần</Button>
        <Button variant="outlined" size="small">Hàng mới</Button>
        <Button variant="outlined" size="small">Bán chạy</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Desktop filters */}
        {!isMobile && <FilterSection />}

        {/* Mobile filters drawer */}
        <Drawer
          anchor="left"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
        >
          <FilterSection />
        </Drawer>

        {/* Product Grid */}
        <Grid container spacing={2} sx={{ flex: 1 }}>
          {mockCollectionItems.map((item) => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {item.discountPercentage > 0 && (
                  <Chip
                    label={`-${item.discountPercentage}%`}
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      zIndex: 1
                    }}
                  />
                )}
                <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                  <CardMedia
                    component="img"
                    image={item.imageUrl}
                    alt={item.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {item.brand}
                  </Typography>
                  <Typography variant="h6" component="h2" sx={{ fontSize: '1rem', mb: 1, minHeight: '2.5rem' }}>
                    {item.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {item.isFreeShip && (
                      <Chip
                        icon={<LocalShippingIcon />}
                        label="Freeship"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {item.isBestSeller && (
                      <Chip
                        icon={<StarIcon />}
                        label="Best Selling"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(item.discountedPrice)}
                    </Typography>
                    {item.discountPercentage > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        {formatPrice(item.originalPrice)}
                      </Typography>
                    )}
                    {item.gift && (
                      <Chip
                        label="QUÀ TẶNG"
                        color="secondary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default CollectionPage;