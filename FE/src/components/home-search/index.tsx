import { keyframes, styled } from "@mui/material";
import IconifyIcon from "../Icon";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDebounce } from "src/hooks/useDebounce";
import { SxProps } from "@mui/material";
import { Theme } from "@mui/material";
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, List, ListItem, ListItemText, ListItemIcon, IconButton, Paper } from "@mui/material";
import { Search as SearchIcon, History, TrendingUp, Close } from "@mui/icons-material";
import { useRouter } from "next/router";
import { getSuggestProduct } from "src/services/product";
import { TParamsGetSuggest } from "src/types/product";

interface THomeSearch {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    sx?: SxProps<Theme>;
}

interface Product {
    id: string;
    name: string;
    price: number;
    newPrice?: number;
    productImage: string;
}

const cursor = keyframes`
  from, to {
    border-right-color: transparent;
  }
  50% {
    border-right-color: currentColor;
  }
`;

const Search = styled('form')(({ theme }) => ({
    position: 'relative',
    height: "38px",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    border: 'none',
    marginLeft: "0 !important",
    width: '100%',
    maxWidth: "600px",
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('button')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    display: 'flex',
    cursor: "pointer",
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
    backgroundColor: theme.palette.primary.main,
    border: 'none',
    outline: 'none',
    color: theme.palette.common.white,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const StyledInputBase = styled('input')(({ theme }) => ({
    color: 'inherit',
    height: '100%',
    width: '40vw',
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(2)})`,
    border: 'none',
    backgroundColor: theme.palette.grey[100],
    outline: 'none',
    '&::placeholder': {
        color: theme.palette.text.secondary,
        borderRight: '2px solid',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        display: 'inline-block',
        animation: `${cursor} 0.75s step-end infinite`
    }
}));

const HomeSearch = (props: THomeSearch) => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    // Props
    const { value, onChange, placeholder = t('search'), sx } = props;

    // State
    const [search, setSearch] = useState(value);
    const [displayPlaceholder, setDisplayPlaceholder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const debouncedSearch = useDebounce(search, 300);
    const [isLoading, setIsLoading] = useState(false);

    const hotKeywords = [
        'Son môi',
        'Kem dưỡng da',
        'Serum',
        'Tẩy trang',
        'Sữa rửa mặt',
        'Kem chống nắng',
        'Mặt nạ',
        'Toner',
        'Kem nền',
        'Phấn phủ'
    ];

    const animatePlaceholder = useCallback(() => {
        const text = placeholder;
        let index = isDeleting ? text.length : 0;
        let currentText = isDeleting ? text : '';

        const interval = setInterval(() => {
            if (!isDeleting && index <= text.length) {
                setDisplayPlaceholder(text.substring(0, index));
                index++;
                if (index > text.length) {
                    setTimeout(() => {
                        setIsDeleting(true);
                    }, 1000); // Pause 1s before deleting
                    clearInterval(interval);
                }
            } else if (isDeleting && index >= 0) {
                setDisplayPlaceholder(text.substring(0, index));
                index--;
                if (index < 0) {
                    setTimeout(() => {
                        setIsDeleting(false);
                    }, 500); // Pause 0.5s before typing again
                    clearInterval(interval);
                }
            }
        }, 100); // Speed of typing/deleting

        return () => clearInterval(interval);
    }, [placeholder, isDeleting]);

    useEffect(() => {
        const animation = animatePlaceholder();
        return () => animation();
    }, [animatePlaceholder]);

    // Load search history from localStorage
    useEffect(() => {
        const history = localStorage.getItem('searchHistory');
        if (history) {
            setSearchHistory(JSON.parse(history));
        }
    }, []);

    // Save search history to localStorage
    const saveSearchHistory = (text: string) => {
        const newHistory = [text, ...searchHistory.filter(item => item !== text)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    // Clear search history
    const clearSearchHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };

    // Fetch suggestions
    const fetchSuggestions = useCallback(async (text: string) => {
        if (text.length < 1) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await getSuggestProduct({
                params: {
                    keyWord: text,
                    size: 5,
                    isPublic: true
                }
            });
            setSuggestions(response?.result || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuggestions(debouncedSearch);
    }, [debouncedSearch, fetchSuggestions]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!search.trim()) return;
        saveSearchHistory(search.trim());
        setShowSuggestions(false);
        onChange(search.trim());
    };

    const handleSuggestionClick = (product: Product) => {
        setSearch(product.name);
        setShowSuggestions(false);
        saveSearchHistory(product.name);
        router.push(`/product/${product.id}`);
    };

    const handleHistoryClick = (text: string) => {
        setSearch(text);
        onChange(text);
    };

    const handleHotKeywordClick = (keyword: string) => {
        setSearch(keyword);
        onChange(keyword);
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Box sx={{ position: 'relative', ...sx }} ref={searchRef}>
            <Search onSubmit={handleSearch}>
                <StyledInputBase
                    type="text"
                    name="home-search"
                    value={search}
                    placeholder={displayPlaceholder}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onClick={() => setShowSuggestions(true)}
                    autoComplete="off"
                    required
                />
                <input type="hidden" name="type" value="product" />
                <SearchIconWrapper type="submit" aria-label="search">
                    <IconifyIcon icon="material-symbols-light:search-rounded" />
                </SearchIconWrapper>
            </Search>

            {showSuggestions && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        mt: 1,
                        maxHeight: '80vh',
                        overflow: 'auto',
                        backgroundColor: 'background.paper',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '600px'
                    }}
                >
                    {isLoading ? (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography>Đang tìm kiếm...</Typography>
                        </Box>
                    ) : suggestions.length > 0 ? (
                        <List>
                            {suggestions.map((product) => (
                                <ListItem
                                    key={product.id}
                                    button
                                    onClick={() => handleSuggestionClick(product)}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        sx={{ 
                                            width: 50, 
                                            height: 50, 
                                            mr: 2,
                                            borderRadius: 1,
                                            objectFit: 'cover'
                                        }}
                                        image={product.productImage}
                                        alt={product.name}
                                    />
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" noWrap>
                                                {product.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Typography color="primary" fontWeight="bold">
                                                    {product.newPrice?.toLocaleString('vi-VN')}đ
                                                </Typography>
                                                {product.newPrice && product.newPrice < product.price && (
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{ textDecoration: 'line-through' }}
                                                    >
                                                        {product.price.toLocaleString('vi-VN')}đ
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <>
                            {searchHistory.length > 0 && (
                                <Box sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Lịch sử tìm kiếm
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={clearSearchHistory}
                                        >
                                            Xóa tất cả
                                        </Button>
                                    </Box>
                                    <List>
                                        {searchHistory.map((item, index) => (
                                            <ListItem
                                                key={index}
                                                button
                                                onClick={() => handleHistoryClick(item)}
                                            >
                                                <ListItemIcon>
                                                    <History />
                                                </ListItemIcon>
                                                <ListItemText primary={item} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            <Box sx={{ p: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                    Từ khóa hot
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {hotKeywords.map((keyword, index) => (
                                        <Button
                                            key={index}
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleHotKeywordClick(keyword)}
                                            startIcon={<TrendingUp />}
                                        >
                                            {keyword}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        </>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default HomeSearch;