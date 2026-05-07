import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import { usePathname } from 'next/navigation';

import { useResponsive } from 'src/hooks/use-responsive';

import TextMaxLine from 'src/components/text-max-line';
import IconifyIcon from 'src/components/Icon';
import { useAuth } from 'src/hooks/useAuth';
import { useTranslation } from 'react-i18next';


// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
};

export default function Nav({ open, onClose }: Props) {
    const mdUp = useResponsive('up', 'md');
    const theme = useTheme();
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const navigations = [
        {
            title: t('my_profile'),
            path: '/account/my-profile',
            icon: <IconifyIcon icon="carbon:user" />,
        },
        {
            title: t('my_order'),
            path: '/account/my-order',
            icon: <IconifyIcon icon="carbon:document" />,
        },
        {
            title: t('wishlist'),
            path: '/account/my-product',
            icon: <IconifyIcon icon="iconoir:favourite-book" />,
        },
        {
            title: t('my_vouchers'),
            path: '/account/my-vouchers',
            icon: <IconifyIcon icon="mdi:voucher-outline" />,
        },
        {
            title: t('change_password'),
            path: '/account/change-password',
            icon: <IconifyIcon icon="mdi:key-outline" />,
        }
    ];

    const renderContent = (
        <Stack
            sx={{
                flexShrink: 0,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[2],
                height: '100%',
                width: 1,
                ...(mdUp && {
                    width: 280,
                    border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.24)}`,
                }),
            }}
        >
            <Stack spacing={2} sx={{ p: 3, pb: 2 }}>
                <Stack spacing={2} direction="row" alignItems="center">
                    <Avatar src={''} sx={{ width: 64, height: 64 }} />
                    <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                            typography: 'caption',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.72 },
                        }}
                    >
                        <IconifyIcon icon="carbon:edit" />
                        {t('change_avatar')}
                    </Stack>
                </Stack>

                <Stack spacing={2}>
                    <TextMaxLine variant="subtitle1" line={1}>
                        {user?.fullName}
                    </TextMaxLine>
                    <TextMaxLine variant="body2" line={1} sx={{ color: 'text.secondary' }}>
                        {user?.email}
                    </TextMaxLine>
                </Stack>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack sx={{ my: 1, px: 2 }}>
                {navigations.map((item) => (
                    <NavItem key={item.title} item={item} />
                ))}
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack sx={{ my: 1, px: 2 }}>
                <ListItemButton
                    sx={{
                        px: 1,
                        height: 44,
                        borderRadius: 1,
                    }}
                    onClick={() => {
                        logout();
                    }}
                >
                    <ListItemIcon>
                        <IconifyIcon icon="carbon:logout" />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('logout')}
                        primaryTypographyProps={{
                            typography: 'body2',
                        }}
                    />
                </ListItemButton>
            </Stack>
        </Stack>
    );

    return (
        <>
            {mdUp ? (
                renderContent
            ) : (
                <Drawer
                    open={open}
                    onClose={onClose}
                    PaperProps={{
                        sx: {
                            width: 280,
                        },
                    }}
                >
                    {renderContent}
                </Drawer>
            )}
        </>
    );
}

// ----------------------------------------------------------------------

type NavItemProps = {
    item: {
        title: string;
        path: string;
        icon: React.ReactNode;
    };
};

function NavItem({ item }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname?.includes(item.path);
    const theme = useTheme();

    return (
        <Link
            component={'a'}
            key={item.title}
            href={item.path}
            underline="none"
        >
            <ListItemButton
                sx={{
                    px: 1,
                    height: 44,
                    borderRadius: 1,
                    ...(isActive && {
                        color: theme.palette.primary.main,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                        },
                    }),
                }}
            >
                <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : '' }}>{item.icon}</ListItemIcon>
                <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                        typography: 'body2',
                        ...(isActive && {
                            color: theme.palette.primary.main,
                        }),
                    }}
                />
            </ListItemButton>
        </Link>
    );
} 