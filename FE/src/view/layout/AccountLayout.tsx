import { ReactNode, Suspense } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { useResponsive } from 'src/hooks/use-responsive';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import Spinner from 'src/components/spinner';
import FloatingChatBot from 'src/components/floating-chat-bot';
// Dynamic imports
const Nav = dynamic(() => import('./nav'), {
  ssr: false,
  loading: () => <Box sx={{ width: { xs: '100%', md: '280px' } }} />
});

const CustomBreadcrumbs = dynamic(() => import('src/components/custom-breadcrum'), {
  ssr: true
});

const IconifyIcon = dynamic(() => import('src/components/Icon'), {
  ssr: true
});

// ----------------------------------------------------------------------

type Props = {
    children: ReactNode;
};

export default function AccountLayout({ children }: Props) {
    const mdUp = useResponsive('up', 'md');
    const theme = useTheme();
    const { t } = useTranslation();
    const pathname = usePathname();

    const breadcrumbItems = [
        { label: t('home'), href: '/', icon: <IconifyIcon color='primary' icon='healthicons:home-outline' /> },
        { label: t('my_account'), href: '/account/my-profile' },
        { label: t(pathname?.split('/').pop()?.replace(/-/g, '_') || ''), href: pathname },
    ];


    return (
        <Container
            sx={{
                maxWidth: '1440px !important',
                pt: { xs: 4, md: 8 },
                pb: { xs: 3, md: 5 },
                px: { xs: 4, md: 8 },
            }}
        >
            <Box sx={{
                mb: '1rem',
                backgroundColor: theme.palette.grey[100],
            }}>
                <Suspense fallback={<Spinner />}>
                    <CustomBreadcrumbs items={breadcrumbItems} />
                </Suspense>
            </Box>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 3 }}
                sx={{ minHeight: 'calc(100vh - 2rem)' }}
            >
                {mdUp && <Nav open={false} onClose={() => { }} />}

                <Box sx={{ flexGrow: 1 }}>
                    {children}
                </Box>
            </Stack>
            <FloatingChatBot />
        </Container>
    );
}
