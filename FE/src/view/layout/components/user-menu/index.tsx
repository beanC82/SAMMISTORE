// React
import React, { useEffect, lazy, Suspense } from "react"

// Next
import Link from "next/link";

// MUI Core Components - grouped by component type
import { 
  Box, 
  Button,
  Divider, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Typography 
} from "@mui/material/";

// MUI - Import components from their direct paths for better tree-shaking
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";


// MUI Styles
import { styled } from "@mui/material/styles";

// Components - Dynamically import non-critical components
const IconifyIcon = lazy(() => import("../../../../components/Icon"));

// Hooks
import { useAuth } from "src/hooks/useAuth";

// Translate
import { useTranslation } from "react-i18next";

// Config
import { ROUTE_CONFIG } from "src/configs/route";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "src/stores";
import Spinner from "src/components/spinner";
type TProps = {}

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const UserMenu = (props: TProps) => {
    const { user, logout, setUser } = useAuth()
    const { userData } = useSelector((state: RootState) => state.auth)
    const userPermission = user?.role?.permissions ?? []
    
    // Translation
    const { t } = useTranslation()

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        if (userData) {
            setUser({ ...userData })
        }
    }, [userData, setUser])

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title={t("account")}>
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                        >
                            <Avatar sx={{ width: 32, height: 32 }}>
                                <Suspense fallback={<Spinner />}>
                                    <IconifyIcon icon="ph:user-thin" />
                                </Suspense>
                            </Avatar>
                        </StyledBadge>
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 2, pb: 2, px: 2 }}>
                    <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                    >
                        <Avatar sx={{ width: 32, height: 32 }}>
                            <Suspense fallback={<Spinner />}>
                                <IconifyIcon icon="ph:user-thin" />
                            </Suspense>
                        </Avatar>
                    </StyledBadge>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography component="span">
                            {user?.fullName}
                        </Typography>
                        <Typography component="span">
                            {user?.role?.name}
                        </Typography>
                    </Box>
                </Box>
                <Divider />
                <Link href={ROUTE_CONFIG.ACCOUNT.MY_PROFILE} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Suspense fallback={<Spinner />}>
                            <IconifyIcon icon="streamline:user-profile-focus" />
                        </Suspense>
                        {t("my_account")}
                    </MenuItem>
                </Link>
                <Link href={ROUTE_CONFIG.ACCOUNT.MY_ORDER} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Suspense fallback={<Spinner />}>
                            <IconifyIcon icon="carbon:document" />
                        </Suspense>
                        {t("my_order")}
                    </MenuItem>
                </Link>
                <Link href={ROUTE_CONFIG.ACCOUNT.MY_PRODUCT} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Suspense fallback={<Spinner />}>
                            <IconifyIcon icon="iconoir:favourite-book" />
                        </Suspense>
                        {t("wishlist")}
                    </MenuItem>
                </Link>
                <Link href={ROUTE_CONFIG.ACCOUNT.CHANGE_PASSWORD} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Suspense fallback={<Spinner />}>
                            <IconifyIcon icon="tabler:lock-password" />
                        </Suspense>
                        {t("change_password")}
                    </MenuItem>
                </Link>
                <MenuItem onClick={logout}
                    sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        startIcon={
                            <Suspense fallback={<Spinner />}>
                                <IconifyIcon icon="humbleicons:logout" />
                            </Suspense>
                        }
                        color="error"
                        sx={{ borderRadius: "6px" }}
                    >
                        {t("logout")}
                    </Button>
                </MenuItem>
            </Menu>
        </React.Fragment>
    )
}

export default UserMenu
