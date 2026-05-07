"use client"

import { NextPage } from "next"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { useRouter } from "next/router"
import dynamic from 'next/dynamic'

// MUI imports - optimized by importing from specific paths
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import { styled, useTheme } from '@mui/material/styles'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'

// Hooks
import { useAuth } from "src/hooks/useAuth"

// Config
import { ROUTE_CONFIG } from "src/configs/route"

// Components
import IconifyIcon from "src/components/Icon"
import HomeSearch from "src/components/home-search"

// Dynamically imported components
const UserMenu = dynamic(() => import("src/view/layout/components/user-menu"), { 
  ssr: false 
})
const ModeToggle = dynamic(() => import("./components/mode-toggle"), { 
  ssr: false 
})
const LanguageDropdown = dynamic(() => import("./components/language-dropdown"), { 
  ssr: false 
})
const ProductCart = dynamic(() => import("./components/product-cart"), { 
  ssr: false 
})

type TProps = {
    open: boolean
    toggleDrawer: () => void
    showIcon?: boolean
    showBanner?: boolean
}

const drawerWidth: number = 0

interface AppBarProps extends MuiAppBarProps {
    open?: boolean
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: prop => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor:
        theme.palette.mode === 'light'
            ? theme.palette.customColors.lightPaperBg
            : theme.palette.customColors.darkPaperBg,
    color: theme.palette.primary.main,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
}))

const HorizontalLayout: NextPage<TProps> = ({ open, toggleDrawer, showIcon, showBanner }) => {

    //state
    const [searchBy, setSearchBy] = useState("");

    //hooks
    const { user } = useAuth()
    const router = useRouter()
    const theme = useTheme()
    const { t } = useTranslation()

    const handleNavigateLogin = () => {
        if (router.asPath !== '/') {
            router.replace({
                pathname: '/login',
                query: {
                    returnUrl: router.asPath
                }
            })
        } else {
        }
        router.replace('/login')
    }

    return (
        <AppBar position="fixed" open={open}
            sx={{ transition: 'background-color 0.3s ease' }}>
            {/* {showBanner && (
                <Box sx={{ width: "100%", height: "auto", maxWidth: "100%" }}>
                    <Image src={TopBanner} width={0} height={0} alt="Top Banner" style={{ width: "100%", height: "auto", maxWidth: "1440px", margin: "0 auto" }} />
                </Box>
            )} */}
            <Toolbar sx={{ margin: '0 auto', display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, width: '100%', paddingLeft: '2rem !important', paddingRight: '2rem !important', transition: 'background-color 0.3s ease', maxWidth: '1440px' }} >
                <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {showIcon && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="drawer"
                            onClick={toggleDrawer}
                            sx={{
                                transition: "transform 0.3s ease",
                            }}
                        >
                            {!open ? (
                                <IconifyIcon icon="material-symbols:menu-rounded" />
                            ) : (
                                <IconifyIcon icon="ic:twotone-menu-open" />
                            )}
                        </IconButton>
                    )}
                    <Link href={ROUTE_CONFIG.HOME}>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                        }}>
                            <Typography component="h4" variant="h3" color="primary" noWrap
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "fit-content",
                                    fontWeight: "600",
                                    background: "linear-gradient(to right, #d82e4d, #f26398)",
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    cursor: "pointer"
                                }}>SammiStores</Typography>
                        </Box>
                    </Link>
                </Box>
                <HomeSearch
                    sx={{
                        flex: 1,
                    }}
                    value={searchBy}
                    placeholder={t("search_by_product_name...")}
                    onChange={(value: string) => setSearchBy(value)} />
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1
                }}>
                    <IconifyIcon fontSize='2.5rem' icon='line-md:phone-call-loop' />
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        <Typography variant="h6" color='primary'>{t('customer_support')}</Typography>
                        <Typography variant="h6" color='primary' fontWeight='bold' >0949067693</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ModeToggle />
                    <LanguageDropdown />
                    <ProductCart />
                    <IconButton color="inherit">
                        <Badge badgeContent={4}
                            color="primary"
                        >
                            <IconifyIcon icon="line-md:bell-loop" />
                        </Badge>
                    </IconButton>
                    {
                        user
                            ? (<UserMenu />)
                            : (
                                <Button onClick={handleNavigateLogin}
                                    variant="contained" sx={{ mt: 3, mb: 2, ml: 2, py: 1.5, width: "auto" }}>
                                    {t("login")}
                                </Button>
                            )
                    }
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default HorizontalLayout