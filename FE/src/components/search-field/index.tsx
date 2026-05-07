import { InputBase } from "@mui/material"
import { styled } from "@mui/material"
import IconifyIcon from "../Icon"
import { useTranslation } from "../../../node_modules/react-i18next"
import { useEffect, useState } from "react"
import { useDebounce } from "src/hooks/useDebounce"
import { SxProps } from "@mui/material"
import { Theme } from "@mui/material"

interface TSearchField {
    value: string,
    onChange: (value: string) => void
    placeholder?: string
    sx?: SxProps<Theme>;
}

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    height: "38px",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.customColors.borderColor}`,
    marginLeft: "0 !important",
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    height: '100%',
    width: '100%',
    '& .MuiInputBase-input': {
        width: '100%',
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        // [theme.breakpoints.up('sm')]: {
        //     width: '12ch',
        //     '&:focus': {
        //         width: '20ch',
        //     },
        // },
    },
}));

const SearchField = (props: TSearchField) => {


    const { t } = useTranslation()

    //props
    const { value, onChange, placeholder = t('search'), sx } = props

    //state
    const [search, setSearch] = useState(value)
    const debouncedSearch = useDebounce(search, 300)


    useEffect(() => {
        onChange(debouncedSearch)
    }, [debouncedSearch])

    return (
        <Search sx={sx}>
            <SearchIconWrapper>
                <IconifyIcon icon="material-symbols-light:search-rounded" />
            </SearchIconWrapper>
            <StyledInputBase
                value={search}
                placeholder={placeholder}
                onChange={e => setSearch(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
            />
        </Search>
    )
}

export default SearchField