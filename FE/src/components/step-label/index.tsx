import { Stack } from "@mui/material";
import { Box } from "@mui/material";

type StepLabelProps = {
    step: string;
    title: string;
};

export default function StepLabel({ step, title }: StepLabelProps) {
    return (
        <Stack direction="row" alignItems="center" sx={{ mb: 3, typography: 'h6', fontWeight: 'bold' }}>
            <Box
                sx={{
                    mr: 1.5,
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                    display: 'flex',
                    typography: 'h6',
                    borderRadius: '50%',
                    alignItems: 'center',
                    bgcolor: 'primary.main',
                    justifyContent: 'center',
                    color: 'primary.contrastText',
                    fontWeight: 500,
                }}
            >
                {step}
            </Box>
            {title}
        </Stack>
    );
}